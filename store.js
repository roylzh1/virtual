import { defineStore } from 'pinia'
export const store = defineStore('account', {
  state: () => ({ 
    count: 0,
    name: ''
   }),
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
  },
})