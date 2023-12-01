import { Launcher } from "./processors/Launcher"

function start() {
  const launcher = new Launcher()
  launcher.launch()
}

export default start