declare module 'fuzzysort' {
    namespace fuzzysort {
        interface Options {
            threshold?: number;
            limit?: number;
            allowTypo?: boolean;
            key?: string | null;
        }

        interface Result {
            target: string;
            score: number;
            indexes: number[];
            obj: any;
        }

        function go(search: string, targets: any[], options?: Options): Result[];
        function highlight(result: Result | null, highlightOpen?: string, highlightClose?: string): string | null;
        function single(search: string, target: string): Result | null;
    }

    export = fuzzysort;
}
