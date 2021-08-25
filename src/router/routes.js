import Home from '../views/Home.vue'
import ContactUs from '@/components/ContactUs.vue'

export default [{
    path: '/contact-us',
    name: 'ContactUs',
    component: ContactUs
  }, {
    path: '/',
    name: 'Home',
    component: Home
  }, {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "About" */ '../views/About.vue')
  }, {
    path: '/coins-r-us',
    name: 'Coins',
    component: () => import(/* webpackChunkName: "Coinage" */ '../components/Coinage.vue')
  }, {
    path: '/cmc-coins-new',
    name: 'CMC Coins',
    component: () => import(/* webpackChunkName: "CMCCoinage" */ '../components/CMCCoinage.vue')
  }, {
    path: '/last-polled',
    name: 'Healthcheck',
    component: () => import(/* webpackChunkName: "Healthcheck" */ '../components/Healthcheck.vue')
  }
];