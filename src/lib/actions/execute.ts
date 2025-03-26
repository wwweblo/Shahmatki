import {isRedirectError} from "next/dist/client/components/redirect-error";

type Options<T> = {
    actionFN: () => Promise<T>;
    successMessage?: string;
};

export const executeAction = async <T>({
    actionFN,
    successMessage = "The actions was successful",
}: Options<T>): Promise<{success: boolean; message: string}> =>{
    try{
        await actionFN();

        return {
            success: true,
            message: successMessage,
        };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        return {
            success: false,
            message: 'error',
        }
    }
}