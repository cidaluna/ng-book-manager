import { Publisher, CreatePublisherDto, UpdatePublisherDto } from '../models/publisher.model';

export class LoadPublishers {
  static readonly type = '[Publishers] Load Publishers';
}

export class LoadPublishersSuccess {
  static readonly type = '[Publishers] Load Publishers Success';
  constructor(public items: Publisher[]) {}
}

export class LoadPublishersFail {
  static readonly type = '[Publishers] Load Publishers Fail';
  constructor(public message: string) {}
}

export class AddPublisher {
  static readonly type = '[Publishers] Add Publisher';
  constructor(public payload: CreatePublisherDto) {}
}

export class AddPublisherSuccess {
  static readonly type = '[Publishers] Add Publisher Success';
  constructor(public publisher: Publisher) {}
}

export class AddPublisherFail {
  static readonly type = '[Publishers] Add Publisher Fail';
  constructor(public message: string) {}
}

export class UpdatePublisher {
  static readonly type = '[Publishers] Update Publisher';
  constructor(public id: string, public changes: UpdatePublisherDto) {}
}

export class UpdatePublisherSuccess {
  static readonly type = '[Publishers] Update Publisher Success';
  constructor(public publisher: Publisher) {}
}

export class UpdatePublisherFail {
  static readonly type = '[Publishers] Update Publisher Fail';
  constructor(public message: string) {}
}

export class DeletePublisher {
  static readonly type = '[Publishers] Delete Publisher';
  constructor(public id: string) {}
}

export class DeletePublisherSuccess {
  static readonly type = '[Publishers] Delete Publisher Success';
  constructor(public id: string) {}
}

/**
 * Por quê esse Fail é diferente dos outros: pode carregar tanto erro de
 * rede/API quanto, futuramente, um erro de regra de negócio vindo do
 * backend (ex: "409 Conflict — editora possui livros vinculados", caso
 * você decida mover essa validação pro servidor no futuro). O formato
 * "message: string" já comporta os dois casos sem mudança de contrato.
 */
export class DeletePublisherFail {
  static readonly type = '[Publishers] Delete Publisher Fail';
  constructor(public message: string) {}
}

export class SelectPublisher {
  static readonly type = '[Publishers] Select Publisher';
  constructor(public id: string | null) {}
}
