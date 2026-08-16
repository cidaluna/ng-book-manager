import { CreatePublisherDto, UpdatePublisherDto } from '../models/publisher.model';

// Convenção NGXS: namespace no static readonly type evita colisão entre features
export class LoadPublishers {
  static readonly type = '[Publishers] Load Publishers';
}

export class AddPublisher {
  static readonly type = '[Publishers] Add Publisher';
  constructor(public payload: CreatePublisherDto) {}
}

export class UpdatePublisher {
  static readonly type = '[Publishers] Update Publisher';
  constructor(public id: string, public changes: UpdatePublisherDto) {}
}

export class DeletePublisher {
  static readonly type = '[Publishers] Delete Publisher';
  constructor(public id: string) {}
}

export class SelectPublisher {
  static readonly type = '[Publishers] Select Publisher';
  constructor(public id: string | null) {}
}
