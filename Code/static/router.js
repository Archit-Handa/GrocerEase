import Home from './components/home.js';
import Login from './components/login.js';
import Signup from './components/signup.js';
import Users from './components/users.js';
import CategoryForm from './components/category-form.js';
import EditCategoryForm from './components/edit-category-form.js';
import ProductForm from './components/product-form.js';
import EditProductForm from './components/edit-product-form.js';
import SendRequest from './components/send-request.js';
import SeeRequest from './components/see-request.js';
import Cart from './components/cart.js';
import Orders from './components/orders.js';
import Stats from './components/stats.js'

const routes = [
    {path: '/', component: Home, name: 'Home'},
    {path: '/login', component: Login, name: 'Login'},
    {path: '/signup', component: Signup, name: 'Signup'},
    {path: '/users', component: Users, name: 'Users'},
    {path: '/create-category', component: CategoryForm, name: 'CategoryForm'},
    {path: '/edit-category/:id', component: EditCategoryForm, name: 'EditCategoryForm'},
    {path: '/create-product', component: ProductForm, name: 'ProductForm'},
    {path: '/edit-product/:id', component: EditProductForm, name: 'EditProductForm'},
    {path: '/send-request', component: SendRequest, name: 'SendRequest'},
    {path: '/see-request', component: SeeRequest, name: 'SeeRequest'},
    {path: '/cart', component: Cart, name: 'Cart'},
    {path: '/stats', component: Stats, name: 'Stats'},
    {path: '/orders', component: Orders, name: 'Orders'},
    {path: '*', redirect: '/'}
]

export default new VueRouter({
    routes
})