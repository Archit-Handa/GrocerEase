import Order from './order.js';

export default {
    template: `
        <div>
            <h3 class="m-3">Past Orders</h3>
            <div class="m-3" v-if="orders.length === 0">No Past Orders</div>
            <Order v-for="order in orders" :key="order.id" :order="order"/>
        </div>
    `,

    data() {
        return {
            orders: []
        }
    },

    components: {
        Order
    },

    async mounted() {
        const response = await fetch('/api/v1/orders', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('auth-token')
            }
        });
        const data = await response.json();

        if (response.ok) {
            this.orders = [];
            for (const order of data.reverse()) {
                const od = order['order_details'].replace(/'/g, '"');
                order['order_details'] = JSON.parse(od);
                this.orders.push(order);
            }
        } else if (response.status === 404) {
            this.orders = [];
        } else {
            alert(data.message);
        }
    }
}