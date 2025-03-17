# Metadata Handler Panel 
A sample panel we developed to improve user's control over project item metadata handling :)

## Things you need to begin
- Premiere Pro 25.2.0 BETA (Build 13) or later, available through Creative Cloud Desktop (CCD)
- UXP Developer Tool-UDT, Version 2.1.0 (2.1.0.30) which is available for download through [Creative Cloud Desktop](https://creativecloud.adobe.com/apps/download/uxp-developer-tools) (CCD)

## Set Up
- Open your console / terminal / command prompt
- Clone this repo at a preferred location of your local computer via ```git clone https://github.com/AdobeDocs/uxp-premiere-pro-samples.git```. This will create a new directory called ```uxp-premiere-pro-samples``` with necessary files to load this panel
- Open the UDT (UXP Developer Tool) and Premiere Pro (Beta)
- In UDT, click the Add Plugin button, and then select the ```manifest.json file``` in the ```uxp-premiere-pro-samples/sample-panels/metadata-handler``` directory
<img width="800" alt="Screenshot 2025-03-07 at 2 52 41 PM" src="https://github.com/user-attachments/assets/55739aed-28dc-4531-8d05-d7e98e42280a" />

- Load panel from UDT and have fun playing with it!
<img width="800" alt="Screenshot 2025-03-07 at 2 53 52 PM" src="https://github.com/user-attachments/assets/7aae497d-6664-4952-bc8a-27497fdda91e" />

## Preview and Known Issues
<img width="714" alt="Screenshot 2025-03-07 at 2 55 15 PM" src="https://github.com/user-attachments/assets/fc82e968-544e-4d0d-b975-d8dc748ce2ff" />

- Currently, metadata updates to multiple selected items are performed as individual actions per items, which can fill and flood the history/undo queue when many items are selected. This can result in large metadata changes not being fully undoable, and other previous UI actions no longer being undoable. This behavior is not intended and is under investigation.


## Special Thanks
Kudos to Fran's CEP Panel, where we get the inspiration of developing a UXP Panel that could improve 
control over metadata :)
