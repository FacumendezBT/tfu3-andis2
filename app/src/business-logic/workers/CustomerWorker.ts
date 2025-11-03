import { RedisCache } from "../../config/RedisCache";
import { CustomerService } from "../services/CustomerService";

(async () => {
    const customerService = new CustomerService();
    const redis = RedisCache.getInstance();
    await redis.connect();

    console.log("Customer worker started...");
    while (true) {
        const job = await redis.dequeueBlocking<any>("queue:customer-events");
        if (!job) continue;

        switch (job.type) {
            case "CUSTOMER_CREATED":
                await customerService.createCustomer(job.payload.body);
                break;
            case "CUSTOMER_UPDATED":
                await customerService.updateCustomer(job.payload.id, job.payload.body);
                break;
            case "CUSTOMER_DELETED":
                await customerService.deleteCustomer(job.payload.id);
                break;
        }
    }
})();

