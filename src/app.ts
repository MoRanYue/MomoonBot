import { Launcher } from "./processors/Launcher"

const launcher = new Launcher()

function start() {
  launcher.launch()
}

export default start
export { launcher }