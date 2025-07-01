import { streamDeck, action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";


@action({ UUID: "com.ryan-peters.obs-ptz-sync.ptzcontroller" })

// extends the singleAction class adding PtzControllerSettings 
export class PtzController extends SingletonAction<PtzControllerSettings> {
    // default constructor for testing an event handler from global settings, move to plugin.ts
    constructor() {
        super();
        streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
            // streamDeck.logger.trace("global " + ev.settings.buttonSelected);
        });
    }

    // event fires when the app becomes visible on the stream deck
    override onWillAppear(ev: WillAppearEvent<PtzControllerSettings>): void | Promise<void> {
    const settings = ev.payload.settings;

    if (!settings.controlType) {
        settings.controlType = "SUPERJOY";
            ev.action.setSettings(settings);
            return;
        }
        streamDeck.settings.getGlobalSettings();
    }

    // event fires when the key is pressed
    override async onKeyDown(ev: KeyDownEvent<PtzControllerSettings>): Promise<void> {
        const { settings } = ev.payload;

        // Set the globally selected camera/button
        if (settings.id) {
            await streamDeck.settings.setGlobalSettings({
                buttonSelected: settings.id,
            });
            streamDeck.settings.getGlobalSettings();
        }

        if (settings.controllerIp && settings.controlId) {
            let url=""

            if(settings.controlType === "RP150")
            {
                url = `http://${settings.controllerIp}/cgi-bin/aw_cam?cmd=XCN:01:${settings.controlId}&res=1`;
                streamDeck.logger.info("Sending RP150: " + url);
            }
            else if(settings.controlType === "SUPERJOY")
            {
                url = `http://${settings.controllerIp}/cgi-bin/joyctrl.cgi?f=camselect&group=5&camid=${settings.controlId}`;
                streamDeck.logger.info("Sending Superjoy: " + url);
            }
            else if(settings.controlType === "KBD")
            {
                url = `http://${settings.controllerIp}/cgi-bin/joyctrl.cgi?f=camselect&group=5&camid=${settings.controlId}`;
                streamDeck.logger.info("Sending Blackmagic KBD: " + url);
            }
            
            try {
                const response = await fetch(url);
            
                if (response.ok) {
                    const data = await response.text();
                    streamDeck.logger.info("Request successful: " + data);
                } else {
                    streamDeck.logger.error("Request failed: " + response.statusText);
                }
            } catch (error) {
                streamDeck.logger.error("Error performing HTTP request: " + error);
            }
        } else {
            streamDeck.logger.error("controllerIp or controlId not provided in the settings.");
        }
    }
}

type PtzControllerSettings = {
    id?: string;
    controllerIp?: string;
    controlId?: string;
    controlType?: string;
};