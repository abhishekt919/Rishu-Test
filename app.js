const path = require("path");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const chalk = require("chalk");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const DBSetup = require("./src/config/DB");
const startTrafficLightCron = require("./src/cronjobs/trafficlight");
const deleteEvent = require("./src/cronjobs/eventCleanup");

const app = express();
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const http = require("http").Server(app);
const socketio = require("socket.io");
const io = socketio(http);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
startTrafficLightCron();
deleteEvent();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

// Super Admin
const indexRouter = require("./src/routes/index");
const legalRoutes = require("./src/routes/Legal");
const accessTokenRoutes = require("./src/routes/AccessToken");
const adminAuthRoutes = require("./src/routes/AdminAuth");
const adminsRoutes = require("./src/routes/Admins");
const machineTypeRoutes = require("./src/routes/MachineType");

app.use("/", indexRouter);
app.use("/api/v1/legal", legalRoutes);
app.use("/api/v1/access-token", accessTokenRoutes);
app.use("/api/v1/admin-auth", adminAuthRoutes);
app.use("/api/v1/admins", adminsRoutes);
app.use("/api/v1/machine-type", machineTypeRoutes);

// Company
const userAuthRoutes = require("./src/routes/UserAuth");
const usersRoutes = require("./src/routes/Users");
const usersPermissionsRoutes = require("./src/routes/UserPermission");
const companyRoutes = require("./src/routes/Company");
const machineRoutes = require("./src/routes/Machine");

app.use("/api/v1/user-auth", userAuthRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/users/permissions", usersPermissionsRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/machines", machineRoutes);

// Product
const productRoutes = require("./src/routes/Product");

app.use("/api/v1/product", productRoutes);

// New Product.
const newProductRoutes = require("./src/routes/newProduct");
app.use("/api/v1/products", newProductRoutes);

//Creating customer in stripe
const customer = require("./src/routes/CustomerRoute");
app.use("/api/v1", customer);

// Traffic lights.
const trafficLights = require("./src/routes/TrafficLight");
app.use("/api/v1/traffic-light", trafficLights);

// Student
const studentRoutes = require("./src/routes/Student");

app.use("/api/v1/student", studentRoutes);

//For events.
const eventRoutes = require("./src/routes/Events");
app.use("/api/v1/events", eventRoutes);

//For booking
const bookingRoutes = require("./src/routes/Booking");
app.use("/api/v1/booking", bookingRoutes);

// For Otp Verification.
const OtpRoutes = require('./src/routes/OtpVerification');
app.use("/api/v1", OtpRoutes);

//Cart
const cartRoutes = require("./src/routes/Cart");

app.use("/api/v1", cartRoutes);

//Contacts

const contactRoutes = require("./src/routes/Contact");

app.use("/api/v1", contactRoutes);

// Upload Files
const uploadFileRoutes = require("./src/routes/FileUpload");
//app.use("/api/v1/upload", uploadFileRoutes);
app.use(
  "/api/v1/uploads",
  express.static(path.join(__dirname, "public/uploads")),
  uploadFileRoutes
);
// Day calculations

const dayRoutes = require("./src/routes/dayRoutes");
app.use("/api/v1", dayRoutes);

// Payment
const paymentRoutes = require("./src/routes/PaymentMethods");
app.use("/api/v1/payment", paymentRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

const server = http.listen(process.env.PORT, function () {
  console.log(chalk.green("✓"), " App is running at", process.env.PORT);
});

io.listen(server);
