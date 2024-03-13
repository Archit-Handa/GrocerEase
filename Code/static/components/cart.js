import CartItem from './cart-item.js';

export default {
    template: `
        <div>
            <h4>Cart</h4>
            <div v-if="cart.length !== 0">
                <p class="fs-5 fw-medium">{{cart.length}} item{{cart.length > 1 ? 's' : ''}}</p>
                <CartItem v-for="cartItem in cart" :key="cartItem.id" :cartItem="cartItem"/>
                <hr class="border border-secondary border-2 opacity-50">
                <div class="row p-3">
                    <div class="col h5">Grand Total</div>
                    <div class="col h5 text-end">₹ {{grandTotal}}</div>
                </div>
                <button class="btn btn-warning mt-3 fs-5 fw-semibold" style="width: 100%; height: 60px;" @click="checkout">Checkout <i class="bi bi-cart4"></i></button>
            </div>
            <div v-else>
                <img :src="'static/images/EmptyCart.png'" alt="Empty Cart" style="height: 400px; width: 100%; object-fit: cover">
            </div>
        </div>
    `,

    data() {
        return {
            cart: this.$store.state.cart
        }
    },

    computed: {
        grandTotal() {
            return this.cart.reduce((sum, cartItem) => {
                const product = this.$store.state.products.find(product => product.id === cartItem.id);
                return sum + (product.rate_per_unit * cartItem.quantity);
            }, 0);
        }
    },

    methods: {
        async checkout() {
            const response = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                },
                body: JSON.stringify({
                    'cart_string': this.$store.state.cart.map(cartItem => {
                        return {
                            'id': cartItem.id,
                            'name': cartItem.name,
                            'rate_per_unit': cartItem.rate_per_unit,
                            'unit': cartItem.unit,
                            'quantity': cartItem.quantity
                        }
                    })
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                this.$router.go();
            }
        }
    },

    components: {
        CartItem
    }
}