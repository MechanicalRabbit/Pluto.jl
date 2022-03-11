import { html, render } from "./imports/Preact.js"
import "./common/NodejsCompatibilityPolyfill.js"

import { Editor } from "./components/Editor.js"

const url_params = new URLSearchParams(window.location.search)
const launch_params = {
    //@ts-ignore
    notebook_id: url_params.get("id") ?? window.pluto_notebook_id,
    //@ts-ignore
    statefile: url_params.get("statefile") ?? window.pluto_statefile,
    //@ts-ignore
    notebookfile: url_params.get("notebookfile") ?? window.pluto_notebookfile,
    //@ts-ignore
    disable_ui: !!(url_params.get("disable_ui") ?? window.pluto_disable_ui),
    //@ts-ignore
    preamble_html: url_params.get("preamble_html") ?? window.pluto_preamble_html,
    //@ts-ignore
    isolated_cell_ids: url_params.has("isolated_cell_id") ? url_params.getAll("isolated_cell_id") : window.pluto_isolated_cell_ids,
    //@ts-ignore
    binder_url: url_params.get("binder_url") ?? window.pluto_binder_url,
    //@ts-ignore
    slider_server_url: url_params.get("slider_server_url") ?? window.pluto_slider_server_url,
    //@ts-ignore
    recording_url: url_params.get("recording_url") ?? window.pluto_recording_url,
    //@ts-ignore
    recording_audio_url: url_params.get("recording_audio_url") ?? window.pluto_recording_audio_url,
}
console.log("Launch parameters: ", launch_params)

// it's like a Rube Goldberg machine
render(html`<${Editor} launch_params=${launch_params} />`, document.body)
