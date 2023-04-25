import sendGrid from "@sendgrid/mail";
sendGrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendEmailTemplate = async (data: any) => {
    sendGrid
        .send({ ...data, from: "no-reply@centiiv.com" })
        .catch((error: any) => {
            console.log(error);
        });
};