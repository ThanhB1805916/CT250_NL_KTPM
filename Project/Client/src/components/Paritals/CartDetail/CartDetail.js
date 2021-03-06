import "./CartDetail.Style.scss";

import { faMinus, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useHistory } from "react-router-dom";
import { useState, useEffect, useContext, useCallback } from "react";
import ReactDOM from "react-dom";
import emailjs from "emailjs-com";
import { CartContext } from "../../../providers/CartProviders";

import Helper from "../../../helpers";
import { caller } from "../../../api_services/servicesContainer";

import Notifications from "../../../common/Notifications";

import { ZaloPaymentService, StripePaymentService } from "../../../api_services/servicesContainer";
import PayPalPayment from "../../../api_services/payment_services/PayPalPayment";
import ProductServices from "../../../api_services/products_services/ProductsService";
import { Input } from "../../Controls";

//==================To the Getway payment ===================

const services = [new ZaloPaymentService(caller), new StripePaymentService(caller)];

const toGetway = (url) => (window.location.href = url);

const checkout = async (type, cart) => toGetway(await services[type].createOrder(cart));
//===========================================================

const CartDetail = () => {
    const [list, setList] = useState([]);

    const [total, setTotal] = useState(0);

    const [down,setDown] = useState(0)

    const { change, forceItem, getItemList, upItem, removeItem, downItem } =
        useContext(CartContext);

    const [display, setDisplay] = useState(false);

    const [show, setShow] = useState(false);

    const [customer, setCustomer] = useState(null);

    const [notify, setNotify] = useState({
        content: "",
        title: "",
        type: "CONFIRMATION",
        infoType: "INFO",
        onHideRequest: setShow,
    });

    useEffect(() => {
        (async () => {
            let listItem = await Promise.all(
                getItemList().map(async (item) => {
                    let data = await ProductServices.getProduct(item.id);

                    let { pd_amount: amount, pd_sold: sold } = data.prod_details[item.type];
                    let somethinselse = amount - sold;
                    if (somethinselse > item.amount) data.amount = Number(item.amount);
                    else {
                        data.amount = somethinselse;
                        forceItem(item.id, item.type, item.currentColor, somethinselse);
                    }
                    if (somethinselse === 0) removeItem(item.id, item.type,item.currentColor);

                    data.choosedType = item.type;
                    data.choosedColor = item.currentColor
                    return data;
                })
            );
            setList(listItem);
        })();
    }, [change, removeItem , forceItem, getItemList]);

    const onValueChange = (id, choosedType,currentColor, type) => {
        switch (type) {
            case "UP":
                upItem(id, choosedType, currentColor);
                break;
            case "DOWN":
                downItem(id, choosedType, currentColor);
                break;
            default:
                return;
        }
    };

    const onRemoveItem = (id, type, currentColor) => {
        setNotify({
            ...notify,
            content: "B???n c?? ch???c mu???n x??a s???n ph???m n??y kh???i gi??? h??ng",
            title: "X??c nh???n",
            type: "CONFIRMATION",
            handle: () => removeItem(id, type,currentColor),
        });
        setShow(true);
    };

    useEffect(() => {
        let count = list.reduce(
            (pre, item) =>{
                let percent = 0

                if (item.prod_details[item.choosedType].pd_discount)
                if (
                    new Date().getTime() <=
                        new Date(item.prod_details[item.choosedType].pd_discount.end).getTime() &&
                    new Date().getTime() >=
                        new Date(item.prod_details[item.choosedType].pd_discount.start).getTime()
                )
                    percent = item.prod_details[item.choosedType].pd_discount.percent

                return pre + Helper.CalcularDiscount(item.prod_details[item.choosedType].pd_price,percent) * item.amount
            },0
        );


        let isDown = list.reduce(
            (pre, item) => pre + Helper.CalcularDiscount(item.prod_details[item.choosedType].pd_price,0) * item.amount,
            0
        );
        setDown(count)
        setTotal(isDown);
    }, [list]);

    const renderPaypalButtonFrame = (cart) => {
        ReactDOM.unmountComponentAtNode(document.querySelector("#paypalwrapper"));
        ReactDOM.render(<PayPalPayment cart={cart} />, document.querySelector("#paypalwrapper"));

        document.querySelector(".paypalarea").classList.add("shower");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return (
        <div className='CartDetail'>
            <h3>Gi??? h??ng c???a b???n</h3>
            <div className='detail-wrapper'>
                <div className='cart-list'>
                    {list.length > 0 ? (
                        <ul>
                            {list.map((item, index) => (
                                <CartItem
                                    key={index}
                                    info={item}
                                    changeValue={onValueChange}
                                    removeItem={onRemoveItem}
                                />
                            ))}
                        </ul>
                    ) : (
                        <p>Gi??? h??ng tr???ng! Ti???p t???c mua h??ng ??i n??o!</p>
                    )}
                </div>
                <div className='cart-transaction'>
                    <div className='wrapper'>
                        <h3>Th??ng tin thanh to??n</h3>
                        <p className='total_title'>Gi?? ti???n:</p>
                        <p className='total_data'>{Helper.Exchange.toMoney(total)} VN??</p>
                        
                        <p className='total_title'>???????c gi???m:</p>
                        <p className='total_data'>{Helper.Exchange.toMoney(total - down)} VN??</p>

                        <p className='total_title'>Th??nh ti???n:</p>
                        <p className='total_data'>{Helper.Exchange.toMoney(down)} VN??</p>

                        <p className='total_title'>S??? l?????ng s???n ph???m:</p>
                        <p className='total_data'>{getItemList().length} s???n ph???m</p>

                        <p className='total_title'>S??? l?????ng chi ti???t:</p>
                        <p className='total_data'>
                            {getItemList().reduce((pre, item) => pre + item.amount, 0)} chi ti???t
                        </p>

                        {list.length>0 && <button
                            title='Thanh to??n ????n h??ng c???a b???n'
                            onClick={() => setDisplay(true)}
                        >
                            Thanh to??n
                        </button> }
                    </div>
                </div>
            </div>
            <CartTransaction display={display} setDisplay={setDisplay} setCustomer={setCustomer} />
            {customer && (
                <DetailTransaction
                    customer={customer}
                    setCustomer={setCustomer}
                    total={down}
                    list={list}
                    renderPaypalButtonFrame={renderPaypalButtonFrame}
                />
            )}
            <Notifications {...notify} isShow={show} onHideRequest={setShow} />
        </div>
    );
};

export default CartDetail;

const DetailTransaction = ({ customer, setCustomer, total, list, renderPaypalButtonFrame }) => {
    const [pos, setPos] = useState(-1);

    useEffect(() => {
        document.querySelector("html").style.overflow = "hidden";
        return () => (document.querySelector("html").style.overflow = "visible");
    }, []);

    const trade = (type) => {
        let index = -1;
        switch (type) {
            case "ZALOPAY":
                setPos(0);
                index = 0;
                break;
            case "STRIPE":
                setPos(1);
                index = 1;
                break;
            case "PAYPAL":
                setPos(2);
                index = 2;
                break;
            default:
                setPos(3);
        }
        const products = list.map((item) => ({
            prod_no: item.prod_no,
            prod_quantity: item.amount,
            pd_no: item.prod_details[item.choosedType].pd_no,
            prod_color: item.choosedColor
        }));
        const cart = { customer, products };
        switch (index) {
            case 0:
                checkout(0, cart);
                break;
            case 1:
                checkout(1, cart);
                break;
            case 2:
                renderPaypalButtonFrame(cart);
                break;
            default:
                checkoutInHome(cart);
        }
    };

    const [defautComplete, setDefaultComplete] = useState(false);
    const { clearItem } = useContext(CartContext);
    async function checkoutInHome(cart) {
        await caller.post("payments/default/createorder", cart);
        emailjs.send(
            "service_yq4sa8u",
            "template_pjgpgn6",
            {
                email: cart.customer.cus_email,
                id: Math.floor(Math.random()*100),
                order: "Thanh to??n khi nh???n h??ng",
                total: Helper.Exchange.toMoney(total) + "VN??",
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleTimeString(),
                address: cart.customer.cus_address,
                phone: cart.customer.cus_phoneNumber,
            },
            "user_bjZeC0AkWf2EgmLIocYkn"
        );
        setTimeout(() => setDefaultComplete(true), 750);
    }

    function rollbackToHome() {
        clearItem();
        window.location.href = "/";
    }

    return (
        <div className='detail_transaction'>
            <div className='detail_wrapper'>
                <h3>X??c nh???n mua h??ng v?? ch???n h??nh th???c thanh to??n</h3>
                <div className='cus_info'>
                    <p>
                        <span>Kh??ch h??ng:</span>
                        {customer.cus_name}
                    </p>
                    <p>
                        <span>S??? CMND/CCCD:</span>
                        {customer.cus_id}
                    </p>
                    <p>
                        <span>Gi???i t??nh:</span>
                        {customer.cus_sex ? "Nam" : "N???"}
                    </p>
                    <p>
                        <span>Email:</span>
                        {customer.cus_email}
                    </p>
                    <p>
                        <span>S??? ??i???n tho???i:</span>
                        {customer.cus_phoneNumber}
                    </p>
                    <p>
                        <span>?????a ch??? nh???n h??ng:</span>
                        {customer.cus_address}
                    </p>
                    <p>
                        <span>T???ng gi?? tr???:</span>
                        {Helper.Exchange.toMoney(total)} VN??
                    </p>
                </div>
                <div className='detail_header'>
                    <p className='dh_name'>T??n s???n ph???m</p>
                    <p className='dh_price'>Phi??n b???n</p>
                    <p className='dh_amount'>M??u s???c</p>
                    <p className='dh_price'>????n gi??</p>
                    <p className='dh_amount'>Gi???m gi??</p>
                    <p className='dh_amount'>S??? l?????ng</p>
                    <p className='dh_total'>Th??nh ti???n</p>
                </div>
                <ul>
                    {list.map((item, index) => (
                        <li key={index}>
                            <p className='dh_name'>{item.prod_name}</p>
                            <p className='dh_price'>
                                {item.prod_details[item.choosedType].pd_storage}
                            </p>
                            <p className='dh_amount'>{item.choosedColor || "M???c ?????nh"}</p>
                            <p className='dh_price'>
                                {Helper.Exchange.toMoney(
                                    item.prod_details[item.choosedType].pd_price
                                )}
                            </p>
                        
                            <p className='dh_amount'>{item.prod_details[item.choosedType].pd_discount?item.prod_details[item.choosedType].pd_discount.percent:0}%</p>
                            <p className='dh_amount'>{item.amount}</p>
                            <p className='dh_total'>
                                {Helper.Exchange.toMoney(Helper.CalcularDiscount(item.prod_details[item.choosedType].pd_price,item.prod_details[item.choosedType].pd_discount?item.prod_details[item.choosedType].pd_discount.percent:0)*
                                        Number(item.amount)
                                )}
                            </p>
                        </li>
                    ))}
                </ul>
                <h3>Ch???n h??nh th???c thanh to??n</h3>
                <div className='transaction-style'>
                    <img
                        style={
                            pos === 0
                                ? { border: "2px solid var(--backgroundColor)", cursor: "progress" }
                                : null
                        }
                        onClick={() => trade("ZALOPAY")}
                        src='/icon/zalopayicon.png'
                        alt='zalo transaction'
                        title='Thanh to??n qua Zalo Pay'
                    />
                    <img
                        style={
                            pos === 1
                                ? { border: "2px solid var(--backgroundColor)", cursor: "progress" }
                                : null
                        }
                        onClick={() => trade("STRIPE")}
                        src='/icon/stripeicon.png'
                        alt='stripe transaction'
                        title='Thanh to??n qua Stripe'
                    />
                    <img
                        style={
                            pos === 2
                                ? { border: "2px solid var(--backgroundColor)", cursor: "progress" }
                                : null
                        }
                        onClick={() => trade("PAYPAL")}
                        src='/icon/paypalicon.png'
                        alt='papal transaction'
                        title='Thanh to??n qua Paypal'
                    />
                    <img
                        style={
                            pos === 2
                                ? { border: "2px solid var(--backgroundColor)", cursor: "progress" }
                                : null
                        }
                        onClick={() => trade("DEFAULT")}
                        src='/icon/defaulticon.png'
                        alt='default transaction'
                        title='Thanh to??n khi nh???n h??ng'
                    />
                </div>
                <FontAwesomeIcon icon={faTimes} onClick={() => setCustomer(null)} />
            </div>
            {defautComplete && (
                <div className='defaulTransactionComplete'>
                    <div className='defaultwrapper'>
                        <img src='/image/success.gif' alt="Success transaction" title="Giao d???ch th??nh c??ng" />
                        <h2>Thanh to??n ????n h??ng th??nh c??ng</h2>
                        <p>Ch??ng t??i ???? g???i th??ng tin h??a ????n ?????n email c???a b???n</p>
                        <button onClick={rollbackToHome}>Tr??? v??? trang ch??nh</button>
                    </div>
                </div>
            )}
        </div>
    );
};

function CartTransaction({ display, setDisplay, setCustomer }) {
    const [ccid, setCcid] = useState("");

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [gender, setGender] = useState(-1);

    const [phone, setPhone] = useState("");

    const [show, setShow] = useState(false);

    const [address, setAddress] = useState({
        province: "",
        district: "",
        commune: "",
        detail: "",
    });

    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:'smooth'
        })
    })

    useEffect(() => {
        document.querySelector("html").style.overflow = display ? "hidden" : "visible";
    }, [display]);

    const [notify, setNotify] = useState({
        content: "",
        title: "",
        type: "INFORMATION",
        infoType: "INFO",
    });

    const leftInput = [
        {
            type: "input",
            value: name,
            name: "name",
            onChange: setName,
            label: "H??? v?? t??n",
            title: "H??? v?? t??n",
        },
        {
            type: "input",
            value: ccid,
            name: "ccid",
            onChange: setCcid,
            label: "S??? CMND/CCCD",
            title: "CMNN/ CCCD",
        },
        {
            type: "input",
            value: email,
            name: "email",
            onChange: setEmail,
            label: "Email",
            title: "?????a ch??? email",
        },
        {
            type: "radio",
            value: gender,
            name: "gender",
            onChange: setGender,
            label: "Gi???i t??nh",
            data: [
                { name: "Nam", value: "1", title: "Gi???i t??nh nam" },
                { name: "N???", value: "0", title: "Gi???i t??nh n???" },
            ],
        },
    ];

    const showResult = (mess) => {
        setNotify({ ...notify, content: mess });
        setShow(true);
    };

    const checkValidation = () => {
        let result = Helper.TransactionValidator.checkingName(name);
        if (!result.result) {
            showResult(result.resson);
            return false;
        }

        result = Helper.TransactionValidator.checkingCCID(ccid);
        if (!result.result) {
            showResult(result.resson);
            return false;
        }

        result = Helper.TransactionValidator.checkingEmail(email);
        if (!result.result) {
            showResult(result.resson);
            return false;
        }

        result = Helper.TransactionValidator.checkingGender(gender);
        if (!result.result) {
            showResult(result.resson);
            return false;
        }

        result = Helper.TransactionValidator.checkingPhone(phone);
        if (!result.result) {
            showResult(result.resson);
            return false;
        }

        if (
            address.province.length === 0 ||
            address.commune.length === 0 ||
            address.district.length === 0 ||
            address.detail.length === 0
        ) {
            showResult("B???n ch??a ho??n th??nh ?????a ch??? nh???n h??ng");
            return false;
        }
        return true;
    };

    const makeAddressTemplate = () =>
        `${address.detail.trim()}, ${address.commune.trim()}, ${address.district.trim()}, ${address.province.trim()}, Vi???t Nam`;

    const transationHandle = () => {
        if (!checkValidation()) return;
        setCustomer({
            cus_name: name,
            cus_id: ccid,
            cus_email: email,
            cus_sex: Number(gender) === 1,
            cus_address: makeAddressTemplate(),
            cus_phoneNumber: phone,
        });
        setDisplay(false);
    };

    return (
        <>
            <div className={`cart-info ${display ? "show" : ""}`}>
                <div className='transaction-wrapper'>
                    <h3>Th??ng tin thanh to??n</h3>
                    <div>
                        <div>
                            {leftInput.map((item, index) => (
                                <Input key={index} {...item} />
                            ))}
                        </div>
                        <div>
                            <Input
                                type='input'
                                value={phone}
                                onChange={setPhone}
                                name='phone'
                                label={"S??? ??i???n tho???i nh???n h??ng"}
                            />
                            <AddressInput
                                value={address}
                                name='address'
                                onChange={setAddress}
                                label={"?????a ch??? nh???n h??ng"}
                            />
                        </div>
                    </div>
                    <div className='behavior'>
                        <button title='H???y thanh to??n' onClick={() => setDisplay(false)}>
                            H???y
                        </button>
                        <button title='Ti???n h??nh thanh to??n' onClick={transationHandle}>
                            Thanh to??n
                        </button>
                    </div>
                </div>
            </div>
            <Notifications {...notify} isShow={show} onHideRequest={setShow} />
        </>
    );
}

const AddressInput = ({ onChange }) => {
    const [chooseLocation, setChooseLocation] = useState({
        province: -1,
        district: -1,
        commune: -1,
        detail: "",
    });

    const [location, setLocation] = useState({
        provinces: [],
        districts: [],
        communes: [],
    });

    const setChange = useCallback(onChange, [onChange]);

    const setAddress = (event, key) => {
        if (typeof event === "string") {
            setChooseLocation({ ...chooseLocation, detail: event });
            setChange((pre) => ({ ...pre, detail: event }));
            return;
        }

        const { target } = event;
        setChange((pre) => ({ ...pre, [key]: target.options[target.selectedIndex].innerText }));
        setChooseLocation((pre) => ({ ...pre, [key]: event.target.value }));
    };

    useEffect(() => {
        (async () => {
            let _province = await Helper.Location.getProvince();
            setLocation((l) => ({ ...l, provinces: _province }));
        })();
    }, []);

    useEffect(() => {
        (async () => {
            let _districts = await Helper.Location.getDistricts(chooseLocation.province);
            setLocation((l) => ({ ...l, districts: _districts }));
            setChooseLocation((c) => ({ ...c, district: -1, commune: -1 }));
            setChange((pre) => ({ ...pre, district: "", commune: "" }));
        })();
    }, [chooseLocation.province, setChange]);

    useEffect(() => {
        (async () => {
            let _commune = await Helper.Location.getCommunes(chooseLocation.district);
            setLocation((l) => ({ ...l, communes: _commune }));
            setChooseLocation((c) => ({ ...c, commune: -1 }));
            setChange((pre) => ({ ...pre, commune: "" }));
        })();
    }, [chooseLocation.district, setChange]);
    const inputs = [
        {
            type: "select",
            value: chooseLocation.province,
            onChange: setAddress,
            label: "Ch???n t???nh/th??nh ph???",
            data: location.provinces,
            keycode: "province",
            title: "Ch???n t???nh/ th??nh ph???",
        },
        {
            type: "select",
            value: chooseLocation.district,
            onChange: setAddress,
            label: "Ch???n huy???n/qu???n",
            data: location.districts,
            keycode: "district",
            title: "Ch???n qu???n/ huy???n",
        },
        {
            type: "select",
            value: chooseLocation.commune,
            onChange: setAddress,
            label: "Ch???n x??/ph?????ng",
            data: location.communes,
            keycode: "commune",
            title: "Ch???n ph?????ng/x??",
        },
    ];
    return (
        <div className='address'>
            <span>?????a ch??? nh???n h??ng</span>
            {inputs.map((item, index) => (
                <Input key={index} {...item} />
            ))}
            <Input
                type='input'
                value={chooseLocation.detail}
                label='S??? nh??/ T??n ???????ng'
                name='house'
                title='S??? nh?? ho???c t??n ???????ng'
                onChange={setAddress}
            />
        </div>
    );
};

function CartItem(props) {
    const { info, changeValue, removeItem } = props;
    
    const history = useHistory();

    const onRemoveItem = (e) => removeItem(info.prod_no, info.choosedType,info.choosedColor);

    const step = (type) => {
        switch (type) {
            case "DOWN":
                info.amount !== 1 && changeValue(info.prod_no, info.choosedType, info.choosedColor, type);
                return;
            case "UP":
                info.amount <
                    info.prod_details[info.choosedType].pd_amount -
                        info.prod_details[info.choosedType].pd_sold &&
                    changeValue(info.prod_no, info.choosedType,info.choosedColor, type);
                return;
            default:
                return;
        }
    };

    const getRealPrice = () =>{
        let percent = 0
        if(info.prod_details[info.choosedType].pd_discount)
        if (
            new Date().getTime() <=
                new Date(info.prod_details[info.choosedType].pd_discount.end).getTime() &&
            new Date().getTime() >=
                new Date(info.prod_details[info.choosedType].pd_discount.start).getTime()
        )
            percent = info.prod_details[info.choosedType].pd_discount.percent
        return Helper.Exchange.toMoney(Helper.CalcularDiscount(info.prod_details[info.choosedType].pd_price, percent))
    }

    return (
        <li>
            <div className='images'>
                <img
                    src={info.prod_imgs[0]}
                    alt={info.prod_name}
                    onClick={() => history.push(`/product/${info.prod_no}`)}
                />
            </div>
            <div className='info'>
                <p className='name'>{info.prod_name}</p>
                <div className='details'>
                    <div className='manufactor'>
                        <p>
                            <span>Nh??n hi???u:</span>
                            {info.prod_manufacturer.brand_name}
                        </p>
                        <p>
                            <span>B??? nh???:</span>
                            {info.prod_details[info.choosedType].pd_storage}
                        </p>
                        <p>
                            <span>Xu???t x???:</span>
                            {info.prod_manufacturer.madeIn}
                        </p>
                    </div>
                    <div className='price'>
                        <p>{info.choosedColor || "M???c ?????nh"}</p>
                        <p>
                            {getRealPrice()}{" "}
                            VN??
                        </p>
                    </div>
                    <div className='amount'>
                        <div className='amountwrapper'>
                            <button title='T??ng s??? l?????ng' onClick={() => step("UP")}>
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <input
                                onKeyDown={(evt) => evt.preventDefault()}
                                type='number'
                                min='1'
                                placeholder='S??? l?????ng'
                                title='S??? l?????ng b???n ???? ?????t'
                                max={
                                    info.prod_details[info.choosedType].pd_amount -
                                    info.prod_details[info.choosedType].pd_sold
                                }
                                value={info.amount}
                                readOnly
                            />
                            <button title='Gi???m s??? l?????ng' onClick={() => step("DOWN")}>
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <span onClick={onRemoveItem}>
                <FontAwesomeIcon icon={faTimes} />
            </span>
        </li>
    );
}
