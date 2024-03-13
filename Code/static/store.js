export default new Vuex.Store({
    state: {
        cart: [],
        products: []
    },

    getters: {
        cart(state) {
            return state.cart;
        },

        products(state) {
            return state.products;
        },

        getItemQuantity: (state) => (id) => {
            return state.cart.find(item => item.id === id)?.quantity || 0;
        }
    },

    mutations: {
        setCart(state, cart) {
            for (const cartItem of cart) {
                const index = state.cart.findIndex(item => item.id === cartItem.id);
                if (index !== -1 && state.cart[index].quantity === cartItem.quantity) {
                    continue;
                }
                const product = state.products.find(product => product.id === cartItem.id);
                const item = {
                    id: cartItem.id,
                    name: product.name,
                    rate_per_unit: product.rate_per_unit,
                    unit: product.unit,
                    quantity: Math.min(cartItem.quantity, product.available_stock)
                }
                item['limited_stock'] = item.quantity === product.available_stock;
                
                state.cart.push(item);
            }

            state.cart = state.cart.filter(item => item.quantity > 0);
        },

        setProducts(state, products) {
            state.products = products;
        },

        updateCart(state, cartItem) {
            const index = state.cart.findIndex(item => item.id === cartItem.id);
            if (index !== -1) {
                state.cart[index].quantity = cartItem.quantity;
            } else {
                const product = state.products.find(product => product.id === cartItem.id);
                const item = {
                    id: cartItem.id,
                    name: product.name,
                    rate_per_unit: product.rate_per_unit,
                    unit: product.unit,
                    quantity: Math.min(cartItem.quantity, product.available_stock)
                }
                item['limited_stock'] = item.quantity === product.available_stock;

                state.cart.push(item);
            }

            state.cart = state.cart.filter(item => item.quantity > 0);

            this.dispatch('pushCart');
        },

        resetState(state) {
            state.cart = [];
            state.products = [];
        }
    },

    actions: {
        async fetchProducts(context) {
            const response = await fetch('/api/v1/product', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });

            if (response.ok) {
                const data = await response.json();
                context.commit('setProducts', data);
            }
        },

        async fetchCart(context) {
            const response = await fetch('/api/v1/cart', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                }
            });

            if (response.ok) {
                const data = await response.json();
                context.commit('setCart', data);
            } else if (response.status === 404) {
                context.commit('setCart', []);
            } else {
                alert(data.message);
            }
        },

        async pushCart(context) {
            const response = await fetch('/api/v1/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('auth-token')
                },
                body: JSON.stringify({ 'cart_string': context.state.cart })
            });
            const data = await response.json();
            if (!response.ok && response.status !== 400) {
                alert(data.message);
            }
        }
    }
});