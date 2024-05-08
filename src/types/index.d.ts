declare module 'expect' {
    interface AsymmetricMatchers {
        toBeChineseEqual(): void;
    }
    interface Matchers<R> {
        toBeChineseEqual(): R;
    }
}