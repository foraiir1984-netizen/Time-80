package expo.modules.notifications.time80
import org.junit.Assert.*
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.atomic.AtomicInteger
class Time80RuntimeTest {
 @Test fun independentOccurrenceIdentities(){assertEquals("time80-occ-v3:4:plan:123",Time80Runtime.occurrenceId("plan",123));assertNotEquals(Time80Runtime.occurrenceId("plan",123),Time80Runtime.occurrenceId("plan",124))}
 @Test fun ownershipExcludesDiagnosticsAndPresentation(){assertTrue(Time80Runtime.owned("time80-2-w-1"));assertFalse(Time80Runtime.owned("time80-test-1"));assertFalse(Time80Runtime.owned("time80-occ-v3:1:x:2"));assertFalse(Time80Runtime.owned("unrelated"))}
 @Test fun commonNativeSerializationIsReentrantAndExcludesConcurrentWriters(){val value=AtomicInteger(0);val latch=CountDownLatch(20);repeat(20){Thread{Time80Runtime.serialized{val before=value.get();Time80Runtime.serialized{value.set(before+1)}};latch.countDown()}.start()};latch.await();assertEquals(20,value.get())}
}
