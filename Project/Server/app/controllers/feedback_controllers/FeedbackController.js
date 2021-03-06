const Controller = require("../Controller");

module.exports = class FeedbackController extends Controller {
  constructor(processor, config) {
    super(config);
    this.processor = processor;
  }

  // Lấy phản hồi mới nhất
  getFeedback = async (req, res) => {
    const feedbackPage = await this.processor.getFeedback(req.query);

    return this.ok(res, feedbackPage);
  };

  addReply = async (req, res) => {
    const {
      body: newReply,
      params: { fb_no },
    } = req;

    const reply = await this.processor.addReply(fb_no, newReply);

    return this.created(res, reply);
  };

  deleteFeedback = async (req, res) => {
    // Xóa feedback trong CSDL
    await this.processor.deleteFeedback(req.params.fb_no);

    return this.noContent(res);
  };

  deleteReply = async (req, res) => {
    await this.processor.deleteReply(req.params.rep_no);

    return this.noContent(res);
  };
};
