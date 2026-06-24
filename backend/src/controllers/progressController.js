const { createProgressRecord: createProgressRecordEntry, getProgressRecordsByUserId } = require("../services/progressStore");

const createProgressRecord = async (req, res, next) => {
  try {
    const record = await createProgressRecordEntry(req.user.id, req.body);

    res.status(201).json({
      message: "Progress logged successfully.",
      record,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const getProgressRecords = async (req, res, next) => {
  try {
    const records = await getProgressRecordsByUserId(req.user.id);
    res.json(records);
  } catch (error) {
    next(error);
  }
};

module.exports = { createProgressRecord, getProgressRecords };
