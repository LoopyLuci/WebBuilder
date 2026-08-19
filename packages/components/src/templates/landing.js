import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const LandingPage = ({ navbar, hero, features, testimonials, pricing, cta, footer, children, sections, }) => {
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [navbar && _jsx(_Fragment, { children: navbar }), _jsxs("main", { className: "flex-1", children: [sections ? (sections.map((section, index) => (_jsx("section", { children: section.content }, index)))) : (_jsxs(_Fragment, { children: [hero, features, testimonials, pricing, cta] })), children] }), footer && _jsx(_Fragment, { children: footer })] }));
};
LandingPage.displayName = 'LandingPage';
export default LandingPage;
//# sourceMappingURL=landing.js.map