import "./DetailAndRate.Style.scss";
import { Comment } from "../../Controls/";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs} from "@fortawesome/free-solid-svg-icons";
import Helper from "../../../helpers";
import { useState, useEffect } from "react";
import ProductServices from "../../../api_services/products_services/ProductsService";
import FeedbackServices from "../../../api_services/feedback_services/FeedbackServices";
import Notifications from "../../../common/Notifications";
const DetailAndRate = ({ id, showDetail }) => {
    const [product, setProduct] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [commnent, setComment] = useState("");
    const [show, setShow] = useState(false);
    const [showInfo, setInfo] = useState(false);
    const [page, setPage] = useState(1);
    const [isMore, setMore] = useState(true);
    const [notify, setNotify] = useState({
        type: "INFOMATION", //CONFIRMARTION, INFORMATION
        title: "", // title of the notifications
        content: "", // content of the notify
        infoType: "INFO",
        duration: 5000, // duration of info notify
    });
    const [isReload, setIsReload] = useState(false)
    useEffect(() => {
        (async () => {
            let data = await ProductServices.getProduct(
                id,
                "prod_name",
                "prod_screen",
                "prod_manufacturer",
                "prod_hardwareAndOS",
                "prod_batteryAndCharger",
                "prod_design"
            );
            setProduct(data);
        })();
    }, [id]);

    const [currentStar,setCurrentStar] = useState({
        currentStar:0,
        commnent:0,
    })

    useEffect(() => {
        (async () => {
            let data = await FeedbackServices.getFeedback(id, 1, 6 * page);
            //----
            let all = await FeedbackServices.getFeedback(id, 1, 1000000);
            setCurrentStar({
                currentStar:Math.round(all.reduce((pre,item)=>pre + Number(item.fb_star)/all.length,0)),
                commnent:all.length
            })

            setFeedback(data);
        })();
    }, [page, id, isReload]);

    const onShowMoreHandle = () => {
        if (page * 6 === feedback.length) setPage((pre) => pre + 1);
        else setMore(false);
    };

    const onShowInfoHandle = () => {
        let data = commnent.trim();
        if (data.length < 6) {
            setNotify({
                ...notify,
                title: "Nội dung không hợp lệ",
                content: "Nội dung phản hồi của bạn quá ngắn!",
            });
            setShow(true);
            return;
        }
        setInfo(true);

    };

    const onSendFeedback = async (data) => {
        let fb = {
            customer:data.info,
            fb_content: commnent,
            fb_star:data.star
        };
        await FeedbackServices.sendFeedback(id, fb);
        setNotify({
            type: "INFOMATION",
            title: "Thành công",
            content: "Cảm ơn bạn đã gửi phản hồi về sản phẩm cho chúng tôi!",
            infoType: "SUCCESS",
        });
        setShow(true);

        setComment("");
        setIsReload(!isReload)
    };
    const getCurrentStar = () =>{
        const stars =[]
        for(let i = 0; i< currentStar.currentStar; i++)
            stars.push(i)
        return <>
            {stars.map((item,index)=><img alt="star" key={index} width="30px" src="/icon/staricon.png"/>)}
        </>
    }

    return (
        <>
            <div className='DetailAndRate'>
                <div className='Comments'>
                    <h3>Nhận xét đánh giá: {getCurrentStar()} {currentStar.commnent>0?<span>(trên {currentStar.commnent} đánh giá)</span>:<span>Chưa có đánh  giá nào</span>}</h3>
                    <div className='comment-area'>
                        <input
                            placeholder='Nhận xét của bạn về sản phẩm'
                            value={commnent}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button onClick={onShowInfoHandle}>Đăng</button>
                    </div>

                    <ul>
                        {feedback.length > 0 ? (
                            <>
                                {feedback.map((item, index) => (
                                    <li key={index}>
                                        <Comment
                                            style={{ background: "#69baff33" }}
                                            title={item.cus_name}
                                            content={item.fb_content}
                                            options='left'
                                            star={item.fb_star}
                                            time={Helper.Exchange.toLocalDate(item.fb_time)}
                                            children={item.replies.map((e, idx) => (
                                                <Comment
                                                    key={idx}
                                                    style={{ background: "#69baff33" }}
                                                    title={e.mod_name}
                                                    content={e.rep_content}
                                                    options='left'
                                                />
                                            ))}
                                        />
                                    </li>
                                ))}
                                {isMore && (
                                    <li className='showMoreFB'>
                                        <button onClick={onShowMoreHandle}>Xem thêm</button>
                                    </li>
                                )}
                            </>
                        ) : (
                            <p>Chưa có đánh giá nào</p>
                        )}
                    </ul>
                </div>
                <div className='DetailInfo'>
                    <h3>Thông số kỹ thuật</h3>
                    <ul className='some_info'>
                        <li>
                            <span>Tên sản phẩm:</span> {product && product.prod_name}
                        </li>
                        <li>
                            <span>Nhãn hiệu:</span>{" "}
                            {product && product.prod_manufacturer.brand_name}
                        </li>
                        <li>
                            <span>Ngày sản xuất:</span>{" "}
                            {product && product.prod_manufacturer.releaseDate}
                        </li>
                        <li>
                            <span>Hệ điều hành:</span> {product && product.prod_hardwareAndOS.os}
                        </li>
                        <li>
                            <span>Vi xử lý:</span> {product && product.prod_hardwareAndOS.cpu}
                        </li>
                        <li>
                            <span>Màn hình:</span> {product && product.prod_screen.type}
                        </li>
                        <li>
                            <span>Pin:</span>{" "}
                            {product && product.prod_batteryAndCharger.batteryType}{" "}
                            {product && product.prod_batteryAndCharger.battery}
                        </li>
                        <li>
                            <span>Thiết kế:</span> {product && product.prod_design.structural}
                        </li>
                        <li>
                            <span>Xuất xứ:</span> {product && product.prod_manufacturer.madeIn}
                        </li>
                    </ul>
                    <div className='detail-ways' onClick={showDetail}>
                        <p>
                            <FontAwesomeIcon icon={faCogs} />
                        </p>
                    </div>
                </div>
            </div>
            {showInfo && (
                <FeedbackCustomerInfo
                    setNotify={setNotify}
                    onSendFeedback={onSendFeedback}
                    setShow={setShow}
                    onHide={setInfo}
                />
            )}
            <Notifications {...notify} onHideRequest={setShow} isShow={show} />
        </>
    );
};

export default DetailAndRate;

const FeedbackCustomerInfo = ({ setNotify, onSendFeedback, setShow, onHide }) => {
    const [name, setName] = useState("");
    const [gender, setGender] = useState(false);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [star, setStar] = useState(5)

    const showNotify = (content) => {
        setNotify((pre) => ({
            type: "INFOMATION",
            infoType: "INFO",
            title: "Thông tin không hợp lệ",
            content: content,
        }));
        setShow(true);
    };

    const checkValidation = () => {
        let message = Helper.TransactionValidator.checkingName(name);

        if (!message.result) {
            showNotify(message.resson);
            return false;
        }
        message = Helper.TransactionValidator.checkingEmail(email);
        if (!message.result) {
            showNotify(message.resson);
            return;
        }
        message = Helper.TransactionValidator.checkingPhone(phone);
        if (!message.result) {
            showNotify(message.resson);
            return false;
        }
        return true;
    };

    const sendFbHandle = () => {
        if (!checkValidation()) return;
        let info = {
            cus_name: name,
            cus_email: email,
            cus_sex: gender,
            cus_phoneNumber: phone,
        };
        onSendFeedback({info, star});
        onHide(false);
    };

    return (
        <div className='customerFeedbackInfo'>
            <div className='customerWrapper'>
                <h2>Thông tin người phản hồi</h2>
                <p>
                    <span>Họ và tên:</span>
                    <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
                </p>
                <p>
                    <span>Giới tính</span>
                    <input
                        type='radio'
                        checked={gender === true}
                        name='gender'
                        readOnly
                        onClick={() => setGender(true)}
                    />
                    <label>Nam</label>
                    <input
                        type='radio'
                        checked={gender === false}
                        name='gender'
                        readOnly
                        onClick={() => setGender(false)}
                    />
                    <label>Nữ</label>
                </p>
                <p>
                    <span>Email:</span>
                    <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                </p>
                <p>
                    <span>Số điện thoại:</span>
                    <input type='tel' value={phone} onChange={(e) => setPhone(e.target.value)} />
                </p>
                <p className="stareddd">
                    <span>Đánh giá sao:</span>
                    <div>
                        <span className={star>=1 ? "checkedcolor":""} onClick={()=>setStar(1)}>{star<1?<i>&#9734;</i>:<i>&#9733;</i>}</span>
                        <span className={star>=2 ? "checkedcolor":""} onClick={()=>setStar(2)}>{star<2?<i>&#9734;</i>:<i>&#9733;</i>}</span>
                        <span className={star>=3 ? "checkedcolor":""} onClick={()=>setStar(3)}>{star<3?<i>&#9734;</i>:<i>&#9733;</i>}</span>
                        <span className={star>=4 ? "checkedcolor":""} onClick={()=>setStar(4)}>{star<4?<i>&#9734;</i>:<i>&#9733;</i>}</span>
                        <span className={star>=5 ? "checkedcolor":""} onClick={()=>setStar(5)}>{star<5?<i>&#9734;</i>:<i>&#9733;</i>}</span>
                    </div>
                </p>
                <div className='fbbehavior'>
                    <button onClick={() => onHide(false)}>Hủy</button>
                    <button onClick={sendFbHandle}>Gửi phản hồi</button>
                </div>
            </div>
        </div>
    );
};
