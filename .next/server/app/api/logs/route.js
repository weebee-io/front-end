/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/logs/route";
exports.ids = ["app/api/logs/route"];
exports.modules = {

/***/ "(rsc)/./app/api/logs/route.ts":
/*!*******************************!*\
  !*** ./app/api/logs/route.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var zod__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! zod */ \"(rsc)/./node_modules/zod/lib/index.mjs\");\n// 파일 경로: app/api/logs/route.ts\n\n\n\n\n// 이벤트 타입 정의\nconst EventType = zod__WEBPACK_IMPORTED_MODULE_3__.z.enum([\n    \"newsViewed\",\n    \"newsSummaryClicked\",\n    \"newsQuizClicked\",\n    \"quizStarted\",\n    \"quizEnded\",\n    \"quizSubmitted\",\n    \"aiWidgetCalled\",\n    \"chatPopupToggled\",\n    \"chatMessageSent\",\n    \"chatMessageError\",\n    \"quizTabViewed\",\n    \"quizHintRequested\"\n]);\n// 이벤트 속성 스키마\nconst EventProperties = zod__WEBPACK_IMPORTED_MODULE_3__.z.object({\n    newsId: zod__WEBPACK_IMPORTED_MODULE_3__.z.number().optional(),\n    quizId: zod__WEBPACK_IMPORTED_MODULE_3__.z.number().optional(),\n    isCorrect: zod__WEBPACK_IMPORTED_MODULE_3__.z.boolean().optional(),\n    responseTimeMs: zod__WEBPACK_IMPORTED_MODULE_3__.z.number().optional(),\n    aiBotUsed: zod__WEBPACK_IMPORTED_MODULE_3__.z.boolean().optional(),\n    streakCount: zod__WEBPACK_IMPORTED_MODULE_3__.z.number().optional(),\n    isOpen: zod__WEBPACK_IMPORTED_MODULE_3__.z.boolean().optional(),\n    messageCount: zod__WEBPACK_IMPORTED_MODULE_3__.z.number().optional(),\n    messageLength: zod__WEBPACK_IMPORTED_MODULE_3__.z.number().optional(),\n    error: zod__WEBPACK_IMPORTED_MODULE_3__.z.string().optional()\n});\n// 로그 요청 스키마\nconst LogRequestSchema = zod__WEBPACK_IMPORTED_MODULE_3__.z.object({\n    eventType: EventType,\n    timestamp: zod__WEBPACK_IMPORTED_MODULE_3__.z.string(),\n    userId: zod__WEBPACK_IMPORTED_MODULE_3__.z.string(),\n    properties: EventProperties\n});\nasync function POST(req) {\n    try {\n        const body = await req.json();\n        console.log(\"Received log request body:\", body);\n        // 요청 데이터 검증\n        const validatedData = LogRequestSchema.parse(body);\n        // logs 디렉토리 경로 구하기 (프로젝트 루트 기준)\n        const logsDir = path__WEBPACK_IMPORTED_MODULE_2___default().join(process.cwd(), \"logs\");\n        if (!fs__WEBPACK_IMPORTED_MODULE_1___default().existsSync(logsDir)) {\n            fs__WEBPACK_IMPORTED_MODULE_1___default().mkdirSync(logsDir);\n        }\n        // 최종 로그 파일 경로 (quiz.log)\n        const logFilePath = path__WEBPACK_IMPORTED_MODULE_2___default().join(logsDir, \"quiz.log\");\n        // 기록할 JSON 한 줄 생성\n        const logObject = {\n            eventType: validatedData.eventType,\n            timestamp: validatedData.timestamp,\n            userId: validatedData.userId,\n            properties: validatedData.properties\n        };\n        const logLine = JSON.stringify(logObject) + \"\\n\";\n        // 파일에 append 방식으로 기록\n        fs__WEBPACK_IMPORTED_MODULE_1___default().appendFileSync(logFilePath, logLine, \"utf8\");\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true\n        });\n    } catch (error) {\n        console.error(\"Error processing log:\", error);\n        if (error instanceof zod__WEBPACK_IMPORTED_MODULE_3__.z.ZodError) {\n            console.error(\"Validation errors:\", error.errors.map((e)=>e.message));\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Invalid request data\",\n                details: error.errors\n            }, {\n                status: 400\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal server error\"\n        }, {\n            status: 500\n        });\n    }\n}\nasync function GET() {\n    // GET 요청은 허용하지 않음\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        success: false,\n        error: \"Method Not Allowed (POST만 허용)\"\n    }, {\n        status: 405\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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d0IsR0FDakM7WUFBRWtDLFFBQVE7UUFBSTtJQUVsQjtBQUNGO0FBRU8sZUFBZUM7SUFDcEIsa0JBQWtCO0lBQ2xCLE9BQU92RCxxREFBWUEsQ0FBQzhCLElBQUksQ0FDdEI7UUFBRWlCLFNBQVM7UUFBTzNCLE9BQU87SUFBZ0MsR0FDekQ7UUFBRWtDLFFBQVE7SUFBSTtBQUVsQiIsInNvdXJjZXMiOlsiL1VzZXJzL3NldW5neWVvbi9EZXNrdG9wL0lUU3R1ZHkvd2VlYmVlL2Zyb250ZW5kL2FwcC9hcGkvbG9ncy9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyDtjIzsnbwg6rK966GcOiBhcHAvYXBpL2xvZ3Mvcm91dGUudHNcblxuaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHogfSBmcm9tIFwiem9kXCI7XG5cbi8vIOydtOuypO2KuCDtg4DsnoUg7KCV7J2YXG5jb25zdCBFdmVudFR5cGUgPSB6LmVudW0oW1xuICBcIm5ld3NWaWV3ZWRcIixcbiAgXCJuZXdzU3VtbWFyeUNsaWNrZWRcIixcbiAgXCJuZXdzUXVpekNsaWNrZWRcIixcbiAgXCJxdWl6U3RhcnRlZFwiLFxuICBcInF1aXpFbmRlZFwiLFxuICBcInF1aXpTdWJtaXR0ZWRcIixcbiAgXCJhaVdpZGdldENhbGxlZFwiLFxuICBcImNoYXRQb3B1cFRvZ2dsZWRcIixcbiAgXCJjaGF0TWVzc2FnZVNlbnRcIixcbiAgXCJjaGF0TWVzc2FnZUVycm9yXCIsXG4gIFwicXVpelRhYlZpZXdlZFwiLFxuICBcInF1aXpIaW50UmVxdWVzdGVkXCJcbl0pO1xuXG4vLyDsnbTrsqTtirgg7IaN7ISxIOyKpO2CpOuniFxuY29uc3QgRXZlbnRQcm9wZXJ0aWVzID0gei5vYmplY3Qoe1xuICBuZXdzSWQ6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgcXVpeklkOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIGlzQ29ycmVjdDogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgcmVzcG9uc2VUaW1lTXM6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgYWlCb3RVc2VkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBzdHJlYWtDb3VudDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBpc09wZW46IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIG1lc3NhZ2VDb3VudDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtZXNzYWdlTGVuZ3RoOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIGVycm9yOiB6LnN0cmluZygpLm9wdGlvbmFsKClcbn0pO1xuXG4vLyDroZzqt7gg7JqU7LKtIOyKpO2CpOuniFxuY29uc3QgTG9nUmVxdWVzdFNjaGVtYSA9IHoub2JqZWN0KHtcbiAgZXZlbnRUeXBlOiBFdmVudFR5cGUsXG4gIHRpbWVzdGFtcDogei5zdHJpbmcoKSxcbiAgdXNlcklkOiB6LnN0cmluZygpLFxuICBwcm9wZXJ0aWVzOiBFdmVudFByb3BlcnRpZXNcbn0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCk7XG4gICAgY29uc29sZS5sb2coXCJSZWNlaXZlZCBsb2cgcmVxdWVzdCBib2R5OlwiLCBib2R5KTtcblxuICAgIC8vIOyalOyyrSDrjbDsnbTthLAg6rKA7KadXG4gICAgY29uc3QgdmFsaWRhdGVkRGF0YSA9IExvZ1JlcXVlc3RTY2hlbWEucGFyc2UoYm9keSk7XG5cbiAgICAvLyBsb2dzIOuUlOugie2GoOumrCDqsr3roZwg6rWs7ZWY6riwICjtlITroZzsoJ3tirgg66Oo7Yq4IOq4sOykgClcbiAgICBjb25zdCBsb2dzRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIFwibG9nc1wiKTtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMobG9nc0RpcikpIHtcbiAgICAgIGZzLm1rZGlyU3luYyhsb2dzRGlyKTtcbiAgICB9XG5cbiAgICAvLyDstZzsooUg66Gc6re4IO2MjOydvCDqsr3roZwgKHF1aXoubG9nKVxuICAgIGNvbnN0IGxvZ0ZpbGVQYXRoID0gcGF0aC5qb2luKGxvZ3NEaXIsIFwicXVpei5sb2dcIik7XG5cbiAgICAvLyDquLDroZ3tlaAgSlNPTiDtlZwg7KSEIOyDneyEsVxuICAgIGNvbnN0IGxvZ09iamVjdCA9IHtcbiAgICAgIGV2ZW50VHlwZTogdmFsaWRhdGVkRGF0YS5ldmVudFR5cGUsXG4gICAgICB0aW1lc3RhbXA6IHZhbGlkYXRlZERhdGEudGltZXN0YW1wLFxuICAgICAgdXNlcklkOiB2YWxpZGF0ZWREYXRhLnVzZXJJZCxcbiAgICAgIHByb3BlcnRpZXM6IHZhbGlkYXRlZERhdGEucHJvcGVydGllc1xuICAgIH07XG4gICAgY29uc3QgbG9nTGluZSA9IEpTT04uc3RyaW5naWZ5KGxvZ09iamVjdCkgKyBcIlxcblwiO1xuXG4gICAgLy8g7YyM7J287JeQIGFwcGVuZCDrsKnsi53snLzroZwg6riw66GdXG4gICAgZnMuYXBwZW5kRmlsZVN5bmMobG9nRmlsZVBhdGgsIGxvZ0xpbmUsIFwidXRmOFwiKTtcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHByb2Nlc3NpbmcgbG9nOlwiLCBlcnJvcik7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2Ygei5ab2RFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIlZhbGlkYXRpb24gZXJyb3JzOlwiLCBlcnJvci5lcnJvcnMubWFwKGUgPT4gZS5tZXNzYWdlKSk7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IFwiSW52YWxpZCByZXF1ZXN0IGRhdGFcIiwgZGV0YWlsczogZXJyb3IuZXJyb3JzIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3JcIiB9LFxuICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICAvLyBHRVQg7JqU7LKt7J2AIO2XiOyaqe2VmOyngCDslYrsnYxcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIk1ldGhvZCBOb3QgQWxsb3dlZCAoUE9TVOunjCDtl4jsmqkpXCIgfSxcbiAgICB7IHN0YXR1czogNDA1IH1cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJmcyIsInBhdGgiLCJ6IiwiRXZlbnRUeXBlIiwiZW51bSIsIkV2ZW50UHJvcGVydGllcyIsIm9iamVjdCIsIm5ld3NJZCIsIm51bWJlciIsIm9wdGlvbmFsIiwicXVpeklkIiwiaXNDb3JyZWN0IiwiYm9vbGVhbiIsInJlc3BvbnNlVGltZU1zIiwiYWlCb3RVc2VkIiwic3RyZWFrQ291bnQiLCJpc09wZW4iLCJtZXNzYWdlQ291bnQiLCJtZXNzYWdlTGVuZ3RoIiwiZXJyb3IiLCJzdHJpbmciLCJMb2dSZXF1ZXN0U2NoZW1hIiwiZXZlbnRUeXBlIiwidGltZXN0YW1wIiwidXNlcklkIiwicHJvcGVydGllcyIsIlBPU1QiLCJyZXEiLCJib2R5IiwianNvbiIsImNvbnNvbGUiLCJsb2ciLCJ2YWxpZGF0ZWREYXRhIiwicGFyc2UiLCJsb2dzRGlyIiwiam9pbiIsInByb2Nlc3MiLCJjd2QiLCJleGlzdHNTeW5jIiwibWtkaXJTeW5jIiwibG9nRmlsZVBhdGgiLCJsb2dPYmplY3QiLCJsb2dMaW5lIiwiSlNPTiIsInN0cmluZ2lmeSIsImFwcGVuZEZpbGVTeW5jIiwic3VjY2VzcyIsIlpvZEVycm9yIiwiZXJyb3JzIiwibWFwIiwiZSIsIm1lc3NhZ2UiLCJkZXRhaWxzIiwic3RhdHVzIiwiR0VUIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/logs/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Flogs%2Froute&page=%2Fapi%2Flogs%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Flogs%2Froute.ts&appDir=%2FUsers%2Fseungyeon%2FDesktop%2FITStudy%2Fweebee%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fseungyeon%2FDesktop%2FITStudy%2Fweebee%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Flogs%2Froute&page=%2Fapi%2Flogs%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Flogs%2Froute.ts&appDir=%2FUsers%2Fseungyeon%2FDesktop%2FITStudy%2Fweebee%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fseungyeon%2FDesktop%2FITStudy%2Fweebee%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_seungyeon_Desktop_ITStudy_weebee_frontend_app_api_logs_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/logs/route.ts */ \"(rsc)/./app/api/logs/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/logs/route\",\n        pathname: \"/api/logs\",\n        filename: \"route\",\n        bundlePath: \"app/api/logs/route\"\n    },\n    resolvedPagePath: \"/Users/seungyeon/Desktop/ITStudy/weebee/frontend/app/api/logs/route.ts\",\n    nextConfigOutput,\n    userland: _Users_seungyeon_Desktop_ITStudy_weebee_frontend_app_api_logs_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZsb2dzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZsb2dzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGbG9ncyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnNldW5neWVvbiUyRkRlc2t0b3AlMkZJVFN0dWR5JTJGd2VlYmVlJTJGZnJvbnRlbmQlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGc2V1bmd5ZW9uJTJGRGVza3RvcCUyRklUU3R1ZHklMkZ3ZWViZWUlMkZmcm9udGVuZCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD1zdGFuZGFsb25lJnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ3NCO0FBQ25HO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvc2V1bmd5ZW9uL0Rlc2t0b3AvSVRTdHVkeS93ZWViZWUvZnJvbnRlbmQvYXBwL2FwaS9sb2dzL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcInN0YW5kYWxvbmVcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvbG9ncy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2xvZ3NcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2xvZ3Mvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvc2V1bmd5ZW9uL0Rlc2t0b3AvSVRTdHVkeS93ZWViZWUvZnJvbnRlbmQvYXBwL2FwaS9sb2dzL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Flogs%2Froute&page=%2Fapi%2Flogs%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Flogs%2Froute.ts&appDir=%2FUsers%2Fseungyeon%2FDesktop%2FITStudy%2Fweebee%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fseungyeon%2FDesktop%2FITStudy%2Fweebee%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/zod"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Flogs%2Froute&page=%2Fapi%2Flogs%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Flogs%2Froute.ts&appDir=%2FUsers%2Fseungyeon%2FDesktop%2FITStudy%2Fweebee%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fseungyeon%2FDesktop%2FITStudy%2Fweebee%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();