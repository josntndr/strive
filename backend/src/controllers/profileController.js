const { createOrUpdateProfile, getProfileByUserId } = require("../services/profileStore");

const upsertProfile = async (req, res, next) => {
  try {
    const profile = await createOrUpdateProfile(req.user.id, req.body);

    res.status(201).json({
      message: "Fitness profile saved successfully.",
      profile,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await getProfileByUserId(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: "Fitness profile not found." });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

module.exports = { upsertProfile, getProfile };
