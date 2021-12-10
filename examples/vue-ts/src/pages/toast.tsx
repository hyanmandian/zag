import { injectGlobal } from "@emotion/css"
import * as Toast from "@ui-machines/toast"
import { normalizeProps, useActor, useMachine, VuePropTypes } from "@ui-machines/vue"
import { HollowDotsSpinner } from "epic-spinners"
import { computed, defineComponent, h, PropType, ref, Fragment } from "vue"
import { toastStyle } from "../../../../shared/style"
import { useMount } from "../hooks/use-mount"

injectGlobal(toastStyle)

const ToastComponent = defineComponent({
  props: {
    actor: {
      type: Object as PropType<Toast.Service>,
      required: true,
    },
  },
  setup(props) {
    const [state, send] = useActor(props.actor)

    const ctx = computed(() => state.value.context)
    const t = computed(() => Toast.connect<VuePropTypes>(state.value, send))

    return () => (
      <pre hidden={!t.value.isVisible} {...t.value.containerProps}>
        <progress max={ctx.value.progress?.max} value={ctx.value.progress?.value} />
        <p>{ctx.value.title}</p>
        {/* @ts-expect-error */}
        <p>{ctx.value.type === "loading" ? <HollowDotsSpinner /> : null}</p>
        <button onClick={t.value.dismiss}>Close</button>
      </pre>
    )
  },
})

export default defineComponent({
  name: "Toast",
  setup() {
    const [state, send] = useMachine(Toast.group.machine, { preserve: true })

    const toastRef = useMount(send)

    const toasts = computed(() => Toast.group.connect<VuePropTypes>(state.value, send, normalizeProps))

    const id = ref<string>()

    return () => {
      return (
        <div ref={toastRef}>
          <button
            onClick={() => {
              id.value = toasts.value.create({
                title: "Welcome",
                description: "Welcome",
                type: "info",
              })
            }}
          >
            Notify
          </button>
          <button
            onClick={() => {
              if (!id.value) return
              toasts.value.update(id.value, {
                title: "Testing",
                type: "loading",
              })
            }}
          >
            Update Child
          </button>
          <button onClick={() => toasts.value.dismiss()}>Close all</button>
          <button onClick={() => toasts.value.pause()}>Pause</button>
          <div {...toasts.value.getContainerProps({ placement: "bottom" })}>
            {state.value.context.toasts.map((actor) => (
              <ToastComponent key={actor.id} actor={actor} />
            ))}
          </div>
        </div>
      )
    }
  },
})
