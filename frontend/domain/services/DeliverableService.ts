import { DeliverableRepository } from "../repositories/DeliverableRepository";

export class DeliverableService {
  static async getDashboardUpcomingDeliverables(limit: number = 3) {
    return DeliverableRepository.findUpcoming(limit);
  }

  static async getContinueWorkingDeliverables(limit: number = 2) {
    return DeliverableRepository.findActive(limit);
  }

  static async getPendingDue(dueDateLessThan: Date, limit: number = 3) {
    return DeliverableRepository.findPendingDue(dueDateLessThan, limit);
  }

  static async getForReview(limit: number = 3) {
    return DeliverableRepository.findForReview(limit);
  }

  static async createDeliverable(data: any) {
    const deliverable = await DeliverableRepository.create(data);
    return deliverable;
  }

  static async updateDeliverable(id: string, data: any) {
    return DeliverableRepository.update(id, data);
  }

  static async deleteDeliverable(id: string) {
    return DeliverableRepository.delete(id);
  }

  static async getById(id: string) {
    return DeliverableRepository.findById(id);
  }

  static async addFile(data: any) {
    return DeliverableRepository.createFile(data);
  }

  static async deleteFile(id: string) {
    return DeliverableRepository.deleteFile(id);
  }

  static async getFileById(id: string) {
    return DeliverableRepository.findFileById(id);
  }

  static async addVersion(data: any) {
    const lastVersion = await DeliverableRepository.findHighestVersion(data.deliverableId);
    const nextVersionNum = (lastVersion?.versionNumber || 0) + 1;
    return DeliverableRepository.createVersion({
      ...data,
      versionNumber: nextVersionNum,
    });
  }

  static async getByShoot(shootId: string) {
    return DeliverableRepository.findByShoot(shootId);
  }

  static async getPending() {
    return DeliverableRepository.findPending(5);
  }
}
