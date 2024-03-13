import UserDashboard from './user-dashboard.js'
import StoreManagerDashboard from './storemanager-dashboard.js'
import AdminDashboard from './admin-dashboard.js'

export default {
    template: `
        <div>
            <UserDashboard v-if="userRole === 'user'" :categories="categories" :products="products"/>
            <StoreManagerDashboard v-if="userRole === 'store_manager'" :categories="categories" :products="products"/>
            <AdminDashboard v-if="userRole === 'admin'" :categories="categories" :products="[]"/>
            <div v-if="error">{{error}}</div>
        </div>
    `,

    data() {
        return {
            userRole: sessionStorage.getItem('role'),
            categories: [],
            products: [],
            error: null
        }
    },

    components: {
        UserDashboard,
        StoreManagerDashboard,
        AdminDashboard
    },

    async mounted() {
        const cat_response = await fetch('/api/v1/category', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('auth-token')
            }
        });
        const cat_data = await cat_response.json();
        
        if (cat_response.ok) {
            this.categories = cat_data;
        } else {
            this.error = cat_data.message;
        }

        const prod_response = await fetch('/api/v1/product', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('auth-token')
            }
        });
        const prod_data = await prod_response.json();
        
        if (cat_response.ok) {
            this.products = prod_data;
        } else {
            this.error = cat_data.message;
        }
    }
}