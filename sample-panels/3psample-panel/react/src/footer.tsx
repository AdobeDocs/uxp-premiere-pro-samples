import { useEffect, useState } from "react";
import Button from "./components/uxp-button";
import * as project from "./utils/project";

const ppro = require("premierepro");
const uxp = require("uxp");

function Footer({ writeToConsole }) {
  const [hasProject, setHasProject] = useState(false);

  useEffect(() => {
    const isProjectLoaded = async () => {
      const result = await ppro.Project.getActiveProject();
      console.log(result);
      setHasProject(result ? true : false);
    };

    isProjectLoaded();
  }, []);

  //Listening to project onload and onclose events
  project.onLoad(() => setHasProject(true));
  project.onClose(() => setHasProject(false));

  //Creating a new project
  const createProject = async () => {
    const file = await uxp.storage.localFileSystem.getFileForSaving(
      `Untitled`,
      {
        types: ["prproj"],
      }
    );

    if (file && file.isFile && file.nativePath) {
      const project = await ppro.Project.createProject(file.nativePath);

      if (project) {
        writeToConsole(`Project created successfully`);
      } else {
        writeToConsole(`Failed to create the Project`);
      }
    }
  };

  //Opening a project
  const openProject = async () => {
    const file = await uxp.storage.localFileSystem.getFileForOpening();
    if (file && file.isFile && file.nativePath) {
      const project = await ppro.Project.open(file.nativePath);

      if (project) {
        writeToConsole(`Project opened successfully`);
      } else {
        writeToConsole(`Failed to open the Project`);
      }
    }
  };

  //Create a new bin
  const createBin = async () => {
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      writeToConsole(`No active project found`);
      return;
    }
    const folderItem = await project.getRootItem();

    const newBin = await folderItem.createBin("new bin", true);
    //folderItem.createBin("new bin", true);
    // project.removeItem(newBin);

    return newBin;
  };

  //Adding media to the project
  const addMedia = async () => {
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      writeToConsole(`No active project found`);
      return;
    }

    const file = await uxp.storage.localFileSystem.getFileForOpening();
    if (file && file.isFile && file.nativePath) {
      const success = project.importFiles(
        [file.nativePath],
        false,
        null,
        false
      );
      if (success) {
        writeToConsole(`Media added successfully`);
      } else {
        writeToConsole(`Failed to add media`);
      }
    }
  };

  //Creating a sequence from the media
  const createSequence = async () => {
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      writeToConsole(`No active project found`);
      return;
    }

    const rootItem = await project.getRootItem();

    const projectItems = await rootItem.getItems();
    const mediaItem = projectItems.find((item: any) => async (item: any) => {
      const clipItem = ppro.ClipProjectItem.cast(item);
      return !(await clipItem.getSequence());
    });
    if (!mediaItem) {
      writeToConsole(`No media to attatch to the sequence.`);
      return;
    }
    const sequence = await project.createSequenceFromMedia(
      mediaItem.name,
      mediaItem
    );

    if (sequence && sequence.name) {
      writeToConsole(`Successfully created sequence with media`);
    } else {
      writeToConsole(`Failed to created sequence with media`);
    }
  };

  //Adding a whip transition to the sequence
  const addTransition = async () => {
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      writeToConsole(`No active project found`);
      return;
    }

    const sequence = await project.getActiveSequence();
    if (!sequence) {
      writeToConsole(`No active sequence found`);
      return;
    }

    const videoTrack = await sequence.getVideoTrack(0);
    const videoTrackItems = await videoTrack.getTrackItems(
      ppro.Constants.TrackItemType.CLIP,
      0
    );

    if (
      !videoTrackItems ||
      videoTrackItems.length === 0 ||
      !videoTrackItems[0]
    ) {
      writeToConsole(`No video track item found`);
      return;
    }

    const videoTransition = await ppro.TransitionFactory.createVideoTransition(
      "AE.ADBE Whip"
    );

    let success = false;
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction: any) => {
        var transitionAction =
          videoTrackItems[0].createAddVideoTransitionAction(videoTransition);
        compoundAction.addAction(transitionAction);
      }, "createAddTransitionAction");
    });

    if (success) {
      writeToConsole(`Transition added successfully`);
    } else {
      writeToConsole(`Failed to add Transition`);
    }
  };

  //Adding position effect to the sequence
  const addPositionEffects = async () => {
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      writeToConsole(`No active project found`);
      return;
    }
    const sequence = await project.getActiveSequence();
    if (!sequence) {
      writeToConsole(`No active project found`);
      return;
    }

    const track = await sequence.getVideoTrack(0);

    const clips = await track.getTrackItems(
      ppro.Constants.TrackItemType.CLIP,
      true
    );

    if (!clips || clips.length === 0 || !clips[0]) {
      writeToConsole(`No video track item found`);
      return;
    }

    const clip = clips[0];
    const comps = await clip.getComponentChain();

    let comp;
    project.lockedAccess(() => {
      comp = comps.getComponentAtIndex(1);
    }); // 'Motion'

    const numParams = await comp.getParamCount();
    let param;
    for (let i = 0; i < numParams; i++) {
      param = await comp.getParam(i);
      const paramName = param.displayName;
      if (paramName === "Position") {
        break;
      }
    }

    //Before adding keyframe to component Param, you need to set time varying action to true
    project.lockedAccess(() => {
      let setTimeVaryingAction = param.createSetTimeVaryingAction(true);
      project.executeTransaction((compoundAction) => {
        compoundAction.addAction(setTimeVaryingAction);
      }, "SetTimeVaryingAction");
    });

    // Create a keyframe of type point
    let pointObj = ppro.PointF(0.5, 0.7);
    let keyframe = param.createKeyframe(pointObj);

    //Add keyframe to component Param
    let success1 = false;
    project.lockedAccess(() => {
      success1 = project.executeTransaction((compoundAction) => {
        var action = param.createAddKeyframeAction(keyframe);
        compoundAction.addAction(action);
      }, "createAddKeyframeAction");
    });

    if (success1) {
      writeToConsole(`Keyframe added to start position`);
    } else {
      writeToConsole(`Failed to add keyframe to start position`);
    }

    pointObj = ppro.PointF(1.5, 0.7);
    keyframe = param.createKeyframe(pointObj);
    keyframe.position = ppro.TickTime.TIME_ONE_SECOND;

    //Add keyframe to component Param
    let success2 = false;
    project.lockedAccess(() => {
      success2 = project.executeTransaction((compoundAction) => {
        var action = param.createAddKeyframeAction(keyframe);
        compoundAction.addAction(action);
      }, "createAddKeyframeAction");
    });

    if (success2) {
      writeToConsole(`Position effect added successfully`);
    } else {
      writeToConsole(`Failed to add position effect`);
    }
  };

  //Adding Rotation effect to the sequence
  const addRotationEffects = async () => {
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      writeToConsole(`No active project found`);
      return;
    }
    const sequence = await project.getActiveSequence();
    if (!sequence) {
      writeToConsole(`No active project found`);
      return;
    }

    const track = await sequence.getVideoTrack(0);
    const clips = await track.getTrackItems(
      ppro.Constants.TrackItemType.CLIP, // 1
      true
    );
    if (!clips || clips.length === 0 || !clips[0]) {
      writeToConsole(`No video track item found`);
      return;
    }

    const clip = clips[0];
    const comps = await clip.getComponentChain();

    let comp;
    project.lockedAccess(() => {
      comp = comps.getComponentAtIndex(1);
    }); // 'Motion'

    const numParams = await comp.getParamCount();
    let param;
    for (let i = 0; i < numParams; i++) {
      param = await comp.getParam(i);
      const paramName = param.displayName;
      if (paramName === "Rotation") {
        break;
      }
    }
    //Before adding keyframe to component Param, you need to set time varying action true

    project.lockedAccess(() => {
      let setTimeVaryingAction = param.createSetTimeVaryingAction(true);

      project.lockedAccess(() => {
        project.executeTransaction((compoundAction) => {
          compoundAction.addAction(setTimeVaryingAction);
        }, "SetTimeVaryingAction");
      });
    });

    // Create a keyframe with point value and position

    let keyframe = param.createKeyframe(0);

    //Add keyframe to component Param
    let success1 = false;
    project.lockedAccess(() => {
      success1 = project.executeTransaction((compoundAction) => {
        var action = param.createAddKeyframeAction(keyframe);
        compoundAction.addAction(action);
      }, "createAddKeyframeAction");
    });

    if (success1) {
      writeToConsole(`Keyframe added to start position`);
    } else {
      writeToConsole(`Failed to add keyframe to start position`);
    }

    keyframe = param.createKeyframe(180);
    keyframe.position = ppro.TickTime.TIME_ONE_SECOND;

    //Add keyframe to component Param
    const success2 = project.executeTransaction((compoundAction) => {
      var action = param.createAddKeyframeAction(keyframe);
      compoundAction.addAction(action);
    }, "createAddKeyframeAction");

    if (success2) {
      writeToConsole(`Rotation effect added successfully`);
    } else {
      writeToConsole(`Failed to add Rotation effect`);
    }
  };

  return (
    <>
      <div className="plugin-footer">
        <Button onClick={openProject}>Open Project</Button>
        <Button onClick={createProject}>Create Project</Button>
        <Button onClick={addMedia} disabled={!hasProject}>
          Add Media
        </Button>
        <Button onClick={createSequence} disabled={!hasProject}>
          Create Sequence
        </Button>
        <Button onClick={addTransition} disabled={!hasProject}>
          Add Transition
        </Button>

        <Button onClick={addPositionEffects} disabled={!hasProject}>
          Add Effects (Left to Right)
        </Button>
        <Button onClick={addRotationEffects} disabled={!hasProject}>
          Add Effects (Rotate 180 degree)
        </Button>
        <Button onClick={createBin} disabled={!hasProject}>
          Create New Bin
        </Button>
      </div>

      <style>{`
        .plugin-footer {
          color:#ccc;
          background-color: #333;
          width: 100%;
          padding: 5px;
        }
      `}</style>
    </>
  );
}

export default Footer;
