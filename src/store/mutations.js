export default {
    addToCustomers(state, newCustomer) {
      state.customers.push(newCustomer);
    },
    setIsLoggedIn(state, flag) {
      state.isLoggedIn = flag;
    },
    incrementCustomerId(state) {
      state.newCustomerId++;
    }
}