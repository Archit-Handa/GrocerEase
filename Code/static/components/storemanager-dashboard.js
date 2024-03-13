import Category from './category.js'

export default {
    template: `
        <div>
            <h3 class="m-3">{{username}}'s Dashboard</h3>
            <Category v-for="(category, index) in categories" :key="index" :category="category" :products="products.message ? null : products.filter(product => product.category.name === category.name)"/>
        </div>
    `,

    props: ['categories', 'products'],

    data() {
        return {
            username: sessionStorage.getItem('username'),
            error: null
        }
    },

    components: {
        Category
    }
}