const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const router = express.Router();

const { Student } = require("../models/Student");
const { HomeOwners } = require("../models/HomeOwners");
const { Admin } = require("../models/Admin");

//student auth
router.post("/student", async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await Student.findOne({
    studentNumber: req.body.studentNumber,
  });
  if (!student)
    return res.status(400).send("Invalid student number or password");
  const validPassword = await bcrypt.compare(
    req.body.password,
    student.password
  );
  if (!validPassword)
    return res.status(400).send("Invalid student number or password");
  const token = student.generateAuthToken();
  res.send(token);
});

//home owners auth
router.post("/homeOwner", async (req, res) => {
  const { error } = validateHomeOwners(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const homeOwner = await HomeOwners.findOne({ email: req.body.email });
  if (!homeOwner) return res.status(400).send("Invalid email or password");
  const validPassword = await bcrypt.compare(
    req.body.password,
    homeOwner.password
  );
  if (!validPassword) return res.status(400).send("Invalid email or password");
  const token = homeOwner.generateAuthToken();
  res.send(token);
});

//admin auth
router.post("/admin", async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(400).send("Invalid email or password");
  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");
  const token = admin.generateAuthToken();
  res.send(token);
});

//validate functions
function validateStudent(student) {
  const schema = {
    studentNumber: Joi.string().required().min(8).max(8),
    password: Joi.string().required().min(8),
  };
  return Joi.validate(student, schema);
}

function validateHomeOwners(homeOwner) {
  const schema = {
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
  };
  return Joi.validate(homeOwner, schema);
}

function validateAdmin(admin) {
  const schema = {
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
  };
  return Joi.validate(admin, schema);
}
module.exports = router;
