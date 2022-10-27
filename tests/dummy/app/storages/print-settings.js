import StorageObject from "ember-local-storage/local/object";

const Storage = StorageObject.extend();

Storage.reopenClass({
  initialState() {
    return {
      width: 8.5,
      height: 11,
      top: 0.5,
      right: 0.5,
      bottom: 0.5,
      left: 0.5,
      orientation: "portrait",
      units: "in",
    };
  },
});

export default Storage;
