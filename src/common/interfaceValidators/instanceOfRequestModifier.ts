import {IRequestModifier} from '../../interface/IRequestModifier';

export function instanceOfRequestModifier(object: object): object is IRequestModifier {
    return typeof (<IRequestModifier>object).getOverride === 'function'
           && typeof (<IRequestModifier>object).isMatchingRequest === 'function';
}
