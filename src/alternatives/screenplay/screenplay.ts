import type { ApiClient, ApiResponse } from "../../core/http/api-client.js";

export interface Ability {}

export interface Task<T> {
  performAs(actor: Actor): Promise<T>;
}

export interface Question<T> {
  answeredBy(actor: Actor): Promise<T> | T;
}

type AbilityConstructor<T extends Ability> = abstract new (...args: never[]) => T;

export class Actor {
  private readonly abilities = new Map<Function, Ability>();

  private constructor(public readonly name: string) {}

  public static named(name: string): Actor {
    return new Actor(name);
  }

  public whoCan<T extends Ability>(ability: T): this {
    this.abilities.set(ability.constructor, ability);
    return this;
  }

  public abilityTo<T extends Ability>(type: AbilityConstructor<T>): T {
    const ability = this.abilities.get(type);
    if (!ability) {
      throw new Error(`${this.name} does not have the requested ability: ${type.name}`);
    }
    return ability as T;
  }

  public attemptsTo<T>(task: Task<T>): Promise<T> {
    return task.performAs(this);
  }

  public asks<T>(question: Question<T>): Promise<T> {
    return Promise.resolve(question.answeredBy(this));
  }
}

export class CallTheDogApi implements Ability {
  public constructor(public readonly api: ApiClient) {}
}

export class ListDogBreeds implements Task<ApiResponse> {
  public constructor(private readonly limit: number) {}

  public performAs(actor: Actor): Promise<ApiResponse> {
    return actor.abilityTo(CallTheDogApi).api.get("/breeds", {
      params: { limit: this.limit },
    });
  }
}

export class SearchDogImages implements Task<ApiResponse> {
  public constructor(
    private readonly limit: number,
    private readonly order: "ASC" | "DESC" | "RANDOM",
  ) {}

  public performAs(actor: Actor): Promise<ApiResponse> {
    return actor.abilityTo(CallTheDogApi).api.get("/images/search", {
      params: { limit: this.limit, order: this.order },
    });
  }
}

export class ResponseStatus implements Question<number> {
  public constructor(private readonly response: ApiResponse) {}

  public answeredBy(_actor: Actor): number {
    return this.response.status;
  }
}

export class ResponseBody implements Question<unknown> {
  public constructor(private readonly response: ApiResponse) {}

  public answeredBy(_actor: Actor): unknown {
    return this.response.body;
  }
}
