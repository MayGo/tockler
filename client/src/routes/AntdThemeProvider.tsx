import React, { useState } from 'react';
import { loadTheme, ITheme as ComputedTheme } from 'antd-theme/lib/loadThemedStyles.js';
import serializedVariableGroups from 'antd-theme/lib//themes';
import Parser from 'antd-theme/lib/parser';

import { tree, contexts, functionRegistry } from 'antd-theme/lib//runtime';

type ThemeVariables = Record<string, any>;

interface Theme {
    name: string;
    variables: Record<string, string | RuntimeValue>;
}

interface ThemeOptions {
    name?: string;
    variables?: ThemeVariables;
}

interface ThemeState extends ThemeOptions {
    name?: string;
    variables?: ThemeVariables;
    themes: Theme[];
}

type ThemeAction = (state: ThemeOptions) => void;

const ThemeContext = React.createContext<[ThemeState, ThemeAction] | undefined>(undefined);

const deserialize = node => {
    if (typeof node === 'boolean') {
        return node;
    }
    switch (node.type) {
        case 'Call':
            return new tree.Call(node.name, node.args.map(deserialize));
        case 'Negative':
            return new tree.Negative(deserialize(node.value));
        case 'Operation':
            return new tree.Operation(node.op, node.operands.map(deserialize));
        case 'Variable':
            return new tree.Variable(node.name);
        case 'Dimension':
            return new tree.Dimension(node.value, deserialize(node.unit));
        case 'Unit':
            return new tree.Unit(node.numerator, node.denominator, node.backupUnit);
        case 'Value':
            return new tree.Value(node.value.map(deserialize));
        case 'Expression':
            return new tree.Expression(node.value.map(deserialize), node.noSpacing);
        case 'Keyword':
            return new tree.Keyword(node.value);
        case 'Condition':
            return new tree.Condition(
                node.op,
                deserialize(node.lvalue),
                deserialize(node.rvalue),
                null,
                node.negate,
            );
        case 'Color':
            return new tree.Color(node.rgb, node.alpha, node.value);
        case 'Url':
            return new tree.URL(node.value);
        case 'Anonymous':
            return new tree.Anonymous(node.value);
        case 'Quoted':
            return new tree.Quoted(node.quote, node.value, node.escaped);
        default:
            throw new Error(`unexcepted type ${node.type}`);
    }
};

interface RuntimeValue {
    expr: Object;
    default: string;
    node: any;
}

const lookup = new Map<string, Theme>();

const themes: Theme[] = Object.keys(serializedVariableGroups).map(name => {
    const serializedVariables = serializedVariableGroups[name];
    const variables: Record<string, string | RuntimeValue> = {};
    Object.keys(serializedVariables).forEach(name => {
        const value = serializedVariables[name];
        if (typeof value === 'object') {
            variables[name] = {
                ...value,
                node: deserialize(value.expr),
            };
        } else {
            variables[name] = value;
        }
    });
    const theme = { name, variables };
    lookup.set(theme.name, theme);
    return theme;
});

function parseVariables(variables: Record<string, string> | undefined) {
    if (!variables) {
        return;
    }
    const result = {};
    Object.keys(variables).forEach(name => {
        result[name] = new Parser(variables[name]).parse();
    });

    return result;
}

function compute(options: ThemeOptions): ComputedTheme {
    const { name, variables: _variables } = options;

    const computed: ComputedTheme = new Map();
    if (!name) {
        return computed;
    }

    const theme = lookup.get(name);

    if (!theme) {
        return computed;
    }

    const variables = parseVariables(_variables);
    const context = new contexts.Eval({}, [
        {
            variable: (name: string) => {
                const _name = name.substr(1);
                if (variables && variables[_name]) {
                    return { value: variables[_name] };
                }
            },
            functionRegistry,
        },
    ]);

    Object.keys(theme.variables).forEach(name => {
        const value = theme.variables[name];
        if (typeof value === 'string') {
            computed.set(name, value);
            return;
        }

        try {
            computed.set(name, value.node.eval(context).toCSS(context));
        } catch (err) {
            computed.set(name, value.default);
        }
    });
    return computed;
}

export function setTheme(theme: ThemeOptions) {
    const variables = compute(theme);
    loadTheme(variables);
    return variables;
}

interface AntdThemeProviderProps {
    theme: ThemeOptions;
    onChange?: (value: ThemeOptions) => void;
}
export const AntdThemeProvider: React.FC<AntdThemeProviderProps> = ({
    theme,
    onChange,
    children,
}) => {
    const running = React.useRef<() => void>();
    const pending = React.useRef<() => void>();
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        pending.current = () => {
            setTimeout(() => {
                const variables = compute(theme);
                loadTheme(variables);
                pending.current = undefined;
                setIsLoading(false);
            }, 0);
        };

        const run = () => {
            if (running.current) {
                return;
            }
            if (!pending.current) {
                return;
            }

            running.current = pending.current;
            pending.current = undefined;
            running.current();
            running.current = undefined;
            run();
        };

        run();
        // eslint-disable-next-line
    }, [theme.name, theme.variables]);

    const onChangeRef = React.useRef(onChange);
    onChangeRef.current = onChange;

    const set = React.useCallback((value: ThemeOptions) => {
        if (onChangeRef.current) {
            onChangeRef.current(value);
        }
    }, []);

    return (
        <ThemeContext.Provider value={[{ ...theme, themes }, set]}>
            {!isLoading && children}
        </ThemeContext.Provider>
    );
};

export function useTheme(): [ThemeOptions, ThemeAction] {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('');
    }
    return context;
}
