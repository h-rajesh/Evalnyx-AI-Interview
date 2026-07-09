import { BehaviorState } from "../behavior/behavior-engine.service";
import { IntegrityEventType } from "./integrity-events";

export interface IntegrityDecision {
  type: IntegrityEventType;
  severity: number;
  metadata?: Record<string, any>;
}

class BehaviorIntegrityService {

    analyze(state: BehaviorState): IntegrityDecision[] {

        return [];

    }

}

export default new BehaviorIntegrityService();