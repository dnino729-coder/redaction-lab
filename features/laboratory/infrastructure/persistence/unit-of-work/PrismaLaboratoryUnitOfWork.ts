import type { UnitOfWork } from "@/features/laboratory/application/ports/UnitOfWork";
import { withStudentContext, withServiceContext } from "@/database/repositories/withStudentContext";
import { runWithActiveTransaction } from "../PrismaClientContext";

export class PrismaLaboratoryUnitOfWork implements UnitOfWork {
  public async execute<T>(work: () => Promise<T>, studentId?: string): Promise<T> {
    if (studentId) {
      return withStudentContext(studentId, (tx) => runWithActiveTransaction(tx, work));
    }
    return withServiceContext((tx) => runWithActiveTransaction(tx, work));
  }
}
