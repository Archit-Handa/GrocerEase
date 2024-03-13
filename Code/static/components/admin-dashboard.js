import Category from './category.js';

export default {
    template: `
        <div>
            <h3 class="ms-3 me-3">{{username}}'s Dashboard</h3>
            <Category v-for="(category, index) in categories" :key="index" :category="category"/>
        </div>
    `,
    
    props: ['categories'],

    data() {
        return {
            username: sessionStorage.getItem('username')
        }
    },

    components: {
        Category
    }
}