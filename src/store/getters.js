export default {
    fetchCustomer(state) {
      return function(id) {
        const matchedCustomers = state.customers.filter(customer => customer.id === id);
        return matchedCustomers.length ? matchedCustomers[0] : '';
      }
    }
}