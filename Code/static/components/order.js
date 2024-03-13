import OrderItem from './order-item.js';

export default {
    template: `
        <div class="bg-body-secondary m-3 p-3 rounded-3">
            <p class="h5">Order ID: {{order.id}}</p>
            <p class="fs-6">Placed on: {{order_date}}</p>
            <div class="row ps-3 pe-3 ms-3 me-3">
                <div class="col fw-bold">Name</div>
                <div class="col fw-bold">Quantity</div>
                <div class="col fw-bold">Price</div>
                <div class="col fw-bold">Subtotal</div>
            </div>
            <OrderItem v-for="(item, index) in order.order_details" :key="index" :item="item"/>
            <hr class="ms-3 me-3 border border-secondary border-1 opacity-50">
            <div class="row ps-3 pe-3 m-3">
                <div class="col-9 fs-6 fw-bold">Total:</div>
                <div class="col  fs-6 fw-bold">₹ {{order_total}}</div>
            </div>
        </div>
    `,

    props: ['order'],

    computed: {
        order_date() {
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              };

            return new Date(this.order.order_date).toLocaleDateString('en-GB', options);
        },

        order_total() {
            let total = 0;
            for (const item of this.order.order_details) {
                total += item.quantity * item.rate_per_unit;
            }
            return total;
        }
    },

    components: {
        OrderItem
    }
}