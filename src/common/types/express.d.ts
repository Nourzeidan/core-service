// declare namespace Express {
//     // ba extend request object to include correlationId and user properties
//     interface Request {
//         correlationId: string;
//         user?: {
//             userId: number;
//             email: string;
//             role: string;
//         };
//     }
// }

// import { JwtPayload } from '../app/auth/utils.js'

// declare global {
//     namespace Express {
//         interface Request {
//             user?: JwtPayload
//         }
//     }
// }

import { JwtPayload } from '../app/auth/utils.js'

declare global {
    namespace Express {
        interface Request {
            correlationId: string
            user?: JwtPayload
        }
    }
}