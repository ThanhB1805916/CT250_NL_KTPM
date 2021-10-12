// Danh sách sp tượng trưng cho CSDL
const PRODUCTS = [
  { prod_no: 1, prod_name: "Sản phẩm thứ I", prod_price: 1000 },
  { prod_no: 2, prod_name: "sản phẩm 2", prod_price: 1000 },
];

module.exports = class PaymentsDAO_Ram {
  emptyData = (data) => {
    return data === undefined;
  };

  getOrderProduct = async ({ prod_no, prod_quantity }) => {
    const prod = PRODUCTS.filter((p) => p.prod_no === prod_no)[0];

    return { ...prod, prod_quantity };
  };

  saveOrder = async (order) => {
    console.log("Đã save", order);

    return order.id;
  };

  getSaveOrder = async (id) => {
    if (id === 1) {
      return {
        id,
        product: PRODUCTS.map((m) => ({
          ...m,
          prod_quantity: 3,
        })),
        customer: "alexander",
        time: Date.now(),
        payment: "Paypal",
        total: 6666666666,
      };
    }
  };
};