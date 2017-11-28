package django;

import org.junit.Assert;
import org.junit.Test;

public class HashersTest {
    @Test
    public void testCheckPassword() throws Exception {
        Assert.assertEquals(Hashers.CheckPasswordResult.CORRECT, Hashers.checkPassword("test".toCharArray(),
                "pbkdf2_sha256$100000$STGJzGsYzTOu$93vfFP97sA+QvEbmkda8OCFneuoa+xlK6CwfTh/+vV0="));
    }

    @Test
    public void testMakePassword() throws Exception {
        String password = Hashers.makePassword("test".toCharArray(), "STGJzGsYzTOu".getBytes(), Hashers.PBKDF2);
        String expected = "pbkdf2_sha256$100000$STGJzGsYzTOu$93vfFP97sA+QvEbmkda8OCFneuoa+xlK6CwfTh/+vV0=";
        Assert.assertEquals(expected, password);
    }
}
