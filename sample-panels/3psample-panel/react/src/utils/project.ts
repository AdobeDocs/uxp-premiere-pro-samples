import { Project, ProjectEventFunction } from "../types/project";
const ppro = require("premierepro");

const onLoad = (callback: ProjectEventFunction) => {
  ppro.eventRoot.addEventListener(
    ppro.Constants.ProjectEvent.OPENED,
    (project: Project) => {
      callback(project!.id, project!.name, project!.path, project);
    }
  );
};

const onClose = (callback: ProjectEventFunction) => {
  ppro.eventRoot.addEventListener(
    ppro.Constants.ProjectEvent.CLOSED,
    (project: Project) => {
      callback(project!.id, project!.name, project!.path, null);
    }
  );
};

const onActivate = (project: any, callback: ProjectEventFunction) => {
  project.addEventListener(
    ppro.Constants.ProjectEvent.ACTIVATED,
    (project: Project) => {
      callback(project!.id, project!.name, project!.path, project);
    }
  );
};

const onDirty = (project: any, callback: ProjectEventFunction) => {
  project.addEventListener(
    ppro.Constants.ProjectEvent.DIRTY,
    (project: Project) => {
      callback(project!.id, project!.name, project!.path, project);
    }
  );
};

const removeEvent = (eventId: string) => {
  ppro.eventRoot.removeEventListener(eventId);
};

export { onLoad, onClose, onDirty, onActivate, removeEvent };
