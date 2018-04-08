//关于vuex，下面放一个官网的例子：
const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment (state) {
            state.count++
        }
    }
})
//如果想要改变state中的count属性，不能直接改变count的状态，而是需要用mutation的提交方式：store.commit('increment');
//我们可以打印看一下此时count的值为多少，console.log(store.state.count) -> 1，此时的值就被我们动态的改变为了1。

/*
由于store中的状态是响应式的，在组件中调用store中的状态仅需要在计算属性中返回即可。触发变化也仅仅是在组件中的methods中提交mutation
*/

/*
假如多个组件需要用到vuex，那么直接在根组件下挂载一个store选项(需调用vue.use(vuex))；然后可以通过this.$store.xxx来访问
mapState辅助函数：当一个组件需要调用多个状态的时候，重复写计算属性的话，会显得很冗余，这个时候我们可以用到mapState辅助函数来生成计算属性。
*/
import { mapState } from 'vuex'

export default {
  // ...
  computed: mapState({
    // 箭头函数可使代码更简练
    count: state => state.count,

    // 传字符串参数 'count' 等同于 `state => state.count`
    countAlias: 'count',

    // 为了能够使用 `this` 获取局部状态，必须使用常规函数
    countPlusLocalState (state) {
      return state.count + this.localCount
    }
  })
}

//当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 mapState 传一个字符串数组。
computed: mapState([
  // 映射 this.count 为 store.state.count
  'count'
])

//关于使用mapState辅助函数与局部计算属性混用的方式：
computed: {
  localComputed () { /* ... */ },
  // 使用对象展开运算符将此对象混入到外部对象中
  ...mapState({
    // ...
  })
}

//组件仍然保有局部状态
//使用 Vuex 并不意味着你需要将所有的状态放入 Vuex。虽然将所有的状态放到 Vuex 会使状态变化更显式和易调试，但也会使代码变得冗长和不直观。如果有些状态严格属于单个组件，最好还是作为组件的局部状态。你应该根据你的应用开发需要进行权衡和确定。

/*
Getter：Vuex 允许我们在 store 中定义“getter”（可以认为是 store 的计算属性）。就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。
既然被当作计算属性，那么就可以直接通过属性的形式去访问，Getter还可以接受其它getter作为第二个参数，直接return返回即可。
*/
const store = new Vuex.Store({
  state: {
    todos: [
      { id: 1, text: '...', done: true },
      { id: 2, text: '...', done: false }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done)
    }
  }
})

// 通过属性访问
// Getter 会暴露为 store.getters 对象，你可以以属性的形式访问这些值：

store.getters.doneTodos // -> [{ id: 1, text: '...', done: true }]
// Getter 也可以接受其他 getter 作为第二个参数：

getters: {
  // ...
  doneTodosCount: (state, getters) => {
    return getters.doneTodos.length
  }
}
store.getters.doneTodosCount // -> 1
// 我们可以很容易地在任何组件中使用它：

computed: {
  doneTodosCount () {
    return this.$store.getters.doneTodosCount
  }
}

// 通过方法访问
// 你也可以通过让 getter 返回一个函数，来实现给 getter 传参。在你对 store 里的数组进行查询时非常有用。

getters: {
  // ...
  getTodoById: (state) => (id) => {
    return state.todos.find(todo => todo.id === id)
  }
}
store.getters.getTodoById(2) // -> { id: 2, text: '...', done: false }
// 注意，getter 在通过方法访问时，每次都会去进行调用，而不会缓存结果。


// mapGetters 辅助函数
// mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性：

import { mapGetters } from 'vuex'

export default {
  // ...
  computed: {
  // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'doneTodosCount',
      'anotherGetter',
      // ...
    ])
  }
}
// 如果你想将一个 getter 属性另取一个名字，使用对象形式：

mapGetters({
  // 映射 `this.doneCount` 为 `store.getters.doneTodosCount`
  doneCount: 'doneTodosCount'
})

// 提交载荷（Payload）
// 你可以向 store.commit 传入额外的参数，即 mutation 的 载荷（payload）：

// ...
mutations: {
  increment (state, n) {
    state.count += n
  }
}
store.commit('increment', 10)
// 在大多数情况下，载荷应该是一个对象，这样可以包含多个字段并且记录的 mutation 会更易读：

// ...
mutations: {
  increment (state, payload) {
    state.count += payload.amount
  }
}
store.commit('increment', {
  amount: 10
})


// 对象风格的提交方式
// 提交 mutation 的另一种方式是直接使用包含 type 属性的对象：

store.commit({
  type: 'increment',
  amount: 10
})
// 当使用对象风格的提交方式，整个对象都作为载荷传给 mutation 函数，因此 handler 保持不变：

mutations: {
  increment (state, payload) {
    state.count += payload.amount
  }
}



// 在组件中提交 Mutation
// 你可以在组件中使用 this.$store.commit('xxx') 提交 mutation，或者使用 mapMutations 辅助函数将组件中的 methods 映射为 store.commit 调用（需要在根节点注入 store）。

import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}



// Action
// Action 类似于 mutation，不同在于：

// Action 提交的是 mutation，而不是直接变更状态。
// Action 可以包含任意异步操作。
// 让我们来注册一个简单的 action：

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  }
})
// Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象，因此你可以调用 context.commit 提交一个 mutation，或者通过 context.state 和 context.getters 来获取 state 和 getters。当我们在之后介绍到 Modules 时，你就知道 context 对象为什么不是 store 实例本身了。

// 实践中，我们会经常用到 ES2015 的 参数解构 来简化代码（特别是我们需要调用 commit 很多次的时候）：

actions: {
  increment ({ commit }) {
    commit('increment')
  }
}


//个人认为，state就是保存数据的地方，mutation和methods差不多的作用(mutation必须是同步)，getter和computed的作用差不多，actions是mutation的异步调用。