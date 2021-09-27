const Controller = require("../Controller");
const {
  NotValidError,
  NotExistError,
  ExistError,
} = require("../../errors/errorsContainer");

module.exports = class ModeratorsController extends Controller {
  constructor(processor, config) {
    super(config);
    this.processor = processor;
  }

  //#region  GET

  // Lấy ra danh sách quản trị viên
  getModerators = async (req, res) => {
    const moderatorsPage = await this.processor.getModerators(req.query);

    return res.json(moderatorsPage);
  };

  // Lấy ra quản trị viên theo mã
  getModeratorByNo = async (req, res) => {
    try {
      const { mod_no } = req.params;

      const moderator = await this.processor.getModeratorByNo(mod_no);

      return res.json(moderator);
    } catch (error) {
      return this.checkError(res, error);
    }
  };

  // Lấy quản trị viên theo số điện thoại
  getModeratorByPhoneNumber = async (req, res) => {
    try {
      const { mod_phoneNumber } = req.params;

      const moderator = await this.processor.getModeratorByPhoneNumber(
        mod_phoneNumber
      );

      return res.json(moderator);
    } catch (error) {
      return this.checkError(res, error);
    }
  };

  // Lấy quản trị viên theo CMND
  getModeratorByMod_Id = async (req, res) => {
    try {
      const { mod_id } = req.params;

      const moderator = await this.processor.getModeratorByMod_Id(mod_id);

      return res.json(moderator);
    } catch (error) {
      return this.checkError(res, error);
    }
  };

  // Lấy quản trị viên theo tài khoản
  getModeratorByUsername = async (req, res) => {
    try {
      const { mod_username } = req.params;

      const moderator = await this.processor.getModeratorByUsername(
        mod_username
      );

      return res.json(moderator);
    } catch (error) {
      return this.checkError(res, error);
    }
  };

  //#endregion

  // Thêm quản trị viên
  addModerator = async (req, res) => {
    try {
      const { body: newModerator } = req;

      const moderator = await this.processor.addModerator(newModerator);

      return res.status(201).json(moderator);
    } catch (error) {
      return this.checkError(res, error);
    }
  };

  // Cập nhật thông tin quản trị viên
  updateModerator = async (req, res) => {
    try {
      const {
        params: { mod_no },
        body: newModerator,
      } = req;

      await this.processor.updateModerator(mod_no, newModerator);

      return res.status(204).json({});
    } catch (error) {
      return this.checkError(res, error);
    }
  };

  // Khóa tài khoản quản trị viên
  lockModerator = async (req, res) => {
    try {
      const { mod_no } = req.params;

      const moderator = await this.processor.getModeratorByNo(mod_no);

      await this.processor.lockModerator(moderator.mod_no);

      return res.status(204).json({});
    } catch (error) {
      return this.checkError(res, error);
    }
  };
};
