import { useUserStore } from '@/store'

const checkAuth = (el, binding) => {
  const { value } = binding
  const userStore = useUserStore()

  if (Array.isArray(value)) {
    if (value.length > 0) {
      let isHas = false
      value.map(item => {
        isHas = userStore.permission.includes(item)
      })

      if (!isHas && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`need permission! Like v-auth="['admin','user']"`)
  }
}

export default {
  mounted(el, binding) {
    checkAuth(el, binding)
  },
  updated(el, binding) {
    checkAuth(el, binding)
  },
};
