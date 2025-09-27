if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const app = express();

// Templating and static
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Database URLs
const LOCAL_DB_URL = process.env.LOCAL_DB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const ATLAS_DB_URL = process.env.ATLASDB_URL;

async function init() {
    console.log("Bootstrapping server...");
    // 1) Connect to DB with fallback
    let usedDbUrl = ATLAS_DB_URL || LOCAL_DB_URL;
    try {
        await mongoose.connect(usedDbUrl, { dbName: "wanderlust" });
        console.log("Connected to database:", usedDbUrl);
    } catch (err) {
        const isSrv = typeof usedDbUrl === "string" && usedDbUrl.startsWith("mongodb+srv://");
        const isDnsErr = err && (err.code === "ENOTFOUND" || /querySrv/i.test(String(err.message)));
        if (isSrv && isDnsErr) {
            console.warn("Atlas SRV DNS lookup failed; falling back to local Mongo:", LOCAL_DB_URL);
            usedDbUrl = LOCAL_DB_URL;
            await mongoose.connect(usedDbUrl, { dbName: "wanderlust" });
            console.log("Connected to database:", usedDbUrl);
        } else {
            console.error("Failed to connect to MongoDB:", err);
        }
    }

    // 2) Sessions
    let store;
    try {
        store = MongoStore.create({
            mongoUrl: usedDbUrl,
            crypto: { secret: process.env.SECRET || "thisshouldbeabettersecret" },
            touchAfter: 24 * 3600,
            dbName: "wanderlust",
        });
        store.on("error", (err) => {
            console.error("Error On Mongo Store", err);
        });
    } catch (err) {
        console.error("Failed to initialize MongoStore. Using in-memory sessions.", err);
    }

    const sessionOptions = {
        store,
        secret: process.env.SECRET || "thisshouldbeabettersecret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    // 3) Auth
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // 4) Template locals
    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currentUser = req.user || null;
        next();
    });

    // 5) Routes
    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // 6) 404 & errors
    app.all("*", (req, res, next) => {
        next(new ExpressError(404, "Page Not Found !!"));
    });
    app.use((err, req, res, next) => {
        const { statusCode = 500 } = err;
        res.status(statusCode).render("error.ejs", { err });
    });

    // 7) Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`server is listening on port ${PORT}`);
    });
}

init();
