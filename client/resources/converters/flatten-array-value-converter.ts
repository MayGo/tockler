import * as moment from "moment";

export class FlattenArrayValueConverter {
    toView(multiDimensionalArray) {
        return [].concat(...multiDimensionalArray);
    }
}