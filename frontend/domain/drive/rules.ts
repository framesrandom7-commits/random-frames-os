export class DriveRules {
  static requireParentIdForSubfolders(parentId?: string) {
    if (!parentId) throw new Error("Parent folder ID is required to create a nested structure.");
  }
}
