import java.io.*;
import java.util.*;

/**
 * Test class containing comprehensive tests for the Book Collection implementation.
 * All test methods are invoked through the start() method.
 */
public class Test {

    private static int testsPassed = 0;
    private static int testsFailed = 0;

    /**
     * Entry point for all tests. Runs each test method and reports results.
     */
    public static void start() {
        System.out.println("=== Book Collection Test Suite ===\n");

        testBookClass();
        testBookCollectionBasic();
        testBookCollectionExceptions();
        testBookCollectionSearch();
        testBookCollectionRandomRemove();
        testBookCollectionMakeEmpty();
        testBookComparators();
        testFromFile();

        System.out.println("\n=== Test Results ===");
        System.out.println("Passed: " + testsPassed);
        System.out.println("Failed: " + testsFailed);
        System.out.println("Total:  " + (testsPassed + testsFailed));

        if (testsFailed == 0) {
            System.out.println("ALL TESTS PASSED!");
        } else {
            System.out.println("SOME TESTS FAILED!");
        }
    }

    // ==================== Assertion Helpers ====================

    private static void assertTrue(String message, boolean condition) {
        if (condition) {
            System.out.println("[PASS] " + message);
            testsPassed++;
        } else {
            System.out.println("[FAIL] " + message);
            testsFailed++;
        }
    }

    private static void assertEquals(String message, Object expected, Object actual) {
        if ((expected == null && actual == null)
                || (expected != null && expected.equals(actual))) {
            System.out.println("[PASS] " + message);
            testsPassed++;
        } else {
            System.out.println("[FAIL] " + message
                    + " (expected: " + expected + ", actual: " + actual + ")");
            testsFailed++;
        }
    }

    private static void assertThrows(String message, Runnable runnable,
                                     Class<? extends Exception> exceptionClass) {
        try {
            runnable.run();
            System.out.println("[FAIL] " + message + " (no exception thrown)");
            testsFailed++;
        } catch (Exception e) {
            if (exceptionClass.isInstance(e)) {
                System.out.println("[PASS] " + message);
                testsPassed++;
            } else {
                System.out.println("[FAIL] " + message
                        + " (wrong exception: " + e.getClass().getName() + ")");
                testsFailed++;
            }
        }
    }

    // ==================== Test Methods ====================

    /**
     * Tests Book class construction, getters, setters, toString, equals, hashCode, compareTo.
     */
    private static void testBookClass() {
        System.out.println("--- Test: Book Class ---");

        Book b1 = new Book("Java Programming", "John Smith", "123-4567890123", 49, 3, "Tech Books");
        Book b2 = new Book("Java Programming", "John Smith", "123-4567890123", 49, 3, "Tech Books");
        Book b3 = new Book("Python Programming", "Jane Doe", "987-6543210987", 39, 1, "Code Press");

        assertTrue("Book toString contains title", b1.toString().contains("Java Programming"));
        assertTrue("Book toString contains author", b1.toString().contains("John Smith"));
        assertTrue("Book toString contains ISBN", b1.toString().contains("123-4567890123"));
        assertTrue("Book toString contains price", b1.toString().contains("price=49"));
        assertTrue("Book toString contains edition", b1.toString().contains("edition=3"));
        assertTrue("Book toString contains publisher", b1.toString().contains("Tech Books"));

        assertEquals("Book equals same ISBN", true, b1.equals(b2));
        assertEquals("Book equals different ISBN", false, b1.equals(b3));
        assertEquals("Book hashCode consistent", true, b1.hashCode() == b2.hashCode());

        assertEquals("Book compareTo same ISBN", 0, b1.compareTo(b2));
        assertEquals("Book compareTo different ISBN", Integer.MIN_VALUE,
                b1.compareTo(b3)); // ISBN strings differ

        // Test setters
        b1.setTitle("New Title");
        assertEquals("Book setter getTitle", "New Title", b1.getTitle());
        b1.setAuthor("New Author");
        assertEquals("Book setter getAuthor", "New Author", b1.getAuthor());
        b1.setListPrice(99);
        assertEquals("Book setter getListPrice", 99, b1.getListPrice());
        b1.setEdition(5);
        assertEquals("Book setter getEdition", 5, b1.getEdition());
        b1.setPublisher("New Publisher");
        assertEquals("Book setter getPublisher", "New Publisher", b1.getPublisher());

        System.out.println();
    }

    /**
     * Tests basic BookCollection operations: add, size, isEmpty, removeLast.
     */
    private static void testBookCollectionBasic() {
        System.out.println("--- Test: Book Collection Basic Operations ---");

        BookCollection collection = new BookCollectionImpl();

        assertTrue("New collection is empty", collection.isEmpty());
        assertEquals("New collection size", 0, collection.size());

        Book b1 = new Book("Book A", "Author A", "ISBN001", 20, 1, "Pub A");
        Book b2 = new Book("Book B", "Author B", "ISBN002", 30, 2, "Pub B");
        Book b3 = new Book("Book C", "Author C", "ISBN003", 40, 3, "Pub C");

        try {
            collection.add(b1);
            collection.add(b2);
            collection.add(b3);
        } catch (BookCollectionException e) {
            System.out.println("[FAIL] Unexpected exception: " + e.getMessage());
            testsFailed++;
            return;
        }

        assertEquals("Collection size after 3 adds", 3, collection.size());
        assertTrue("Collection not empty after adds", !collection.isEmpty());

        try {
            Book removed = collection.removeLast();
            assertEquals("removeLast returns last added", b3, removed);
            assertEquals("Size after removeLast", 2, collection.size());

            removed = collection.removeLast();
            assertEquals("removeLast returns second", b2, removed);
            assertEquals("Size after second removeLast", 1, collection.size());

            removed = collection.removeLast();
            assertEquals("removeLast returns first", b1, removed);
            assertEquals("Size after all removed", 0, collection.size());
            assertTrue("Collection empty after all removed", collection.isEmpty());
        } catch (BookCollectionException e) {
            System.out.println("[FAIL] Unexpected exception: " + e.getMessage());
            testsFailed++;
        }

        System.out.println();
    }

    /**
     * Tests exception handling: empty collection removal, index out of bounds.
     */
    private static void testBookCollectionExceptions() {
        System.out.println("--- Test: Exception Handling ---");

        BookCollection collection = new BookCollectionImpl();

        assertThrows("removeLast on empty throws BookCollectionException",
                () -> { collection.removeLast(); },
                BookCollectionException.class);

        assertThrows("removeRandom on empty throws BookCollectionException",
                () -> { collection.removeRandom(); },
                BookCollectionException.class);

        Book b = new Book("Test Book", "Test Author", "ISBN999", 10, 1, "Test Pub");
        try {
            collection.add(b);
        } catch (BookCollectionException e) {
            System.out.println("[FAIL] Unexpected exception on add: " + e.getMessage());
            testsFailed++;
            return;
        }

        assertThrows("get(int) with negative index throws exception",
                () -> { collection.get(-1); },
                BookCollectionIndexOutOfBoundsException.class);

        assertThrows("get(int) with index >= size throws exception",
                () -> { collection.get(5); },
                BookCollectionIndexOutOfBoundsException.class);

        System.out.println();
    }

    /**
     * Tests search functionality: get(Book) method.
     */
    private static void testBookCollectionSearch() {
        System.out.println("--- Test: Search Operations ---");

        BookCollection collection = new BookCollectionImpl();
        Book b1 = new Book("Alpha", "A", "A001", 10, 1, "P1");
        Book b2 = new Book("Beta", "B", "B001", 20, 2, "P2");
        Book b3 = new Book("Gamma", "C", "C001", 30, 3, "P3");

        try {
            collection.add(b1);
            collection.add(b2);
            collection.add(b3);
        } catch (BookCollectionException e) {
            System.out.println("[FAIL] Unexpected exception: " + e.getMessage());
            testsFailed++;
            return;
        }

        assertEquals("get(Book) finds first book", 0, collection.get(b1));
        assertEquals("get(Book) finds second book", 1, collection.get(b2));
        assertEquals("get(Book) finds third book", 2, collection.get(b3));

        Book notFound = new Book("Not Real", "Nobody", "XXXXX", 0, 0, "None");
        assertEquals("get(Book) returns -1 for missing book", -1, collection.get(notFound));

        System.out.println();
    }

    /**
     * Tests removeRandom functionality.
     */
    private static void testBookCollectionRandomRemove() {
        System.out.println("--- Test: Random Remove ---");

        BookCollection collection = new BookCollectionImpl();
        Book b1 = new Book("R1", "A", "R001", 10, 1, "P1");
        Book b2 = new Book("R2", "B", "R002", 20, 2, "P2");
        Book b3 = new Book("R3", "C", "R003", 30, 3, "P3");

        try {
            collection.add(b1);
            collection.add(b2);
            collection.add(b3);
        } catch (BookCollectionException e) {
            System.out.println("[FAIL] Unexpected exception: " + e.getMessage());
            testsFailed++;
            return;
        }

        assertEquals("Size before random remove", 3, collection.size());

        try {
            Book removed = collection.removeRandom();
            assertTrue("removeRandom returns a valid book",
                    removed.equals(b1) || removed.equals(b2) || removed.equals(b3));
            assertEquals("Size after random remove", 2, collection.size());

            // Remove remaining
            collection.removeLast();
            collection.removeLast();
            assertTrue("Collection empty after removing all", collection.isEmpty());
        } catch (BookCollectionException e) {
            System.out.println("[FAIL] Unexpected exception: " + e.getMessage());
            testsFailed++;
        }

        System.out.println();
    }

    /**
     * Tests makeEmpty functionality.
     */
    private static void testBookCollectionMakeEmpty() {
        System.out.println("--- Test: Make Empty ---");

        BookCollection collection = new BookCollectionImpl();
        Book b1 = new Book("M1", "A", "M001", 10, 1, "P1");
        Book b2 = new Book("M2", "B", "M002", 20, 2, "P2");

        try {
            collection.add(b1);
            collection.add(b2);
        } catch (BookCollectionException e) {
            System.out.println("[FAIL] Unexpected exception: " + e.getMessage());
            testsFailed++;
            return;
        }

        assertEquals("Size before makeEmpty", 2, collection.size());
        collection.makeEmpty();
        assertTrue("Collection empty after makeEmpty", collection.isEmpty());
        assertEquals("Size after makeEmpty", 0, collection.size());

        // Can add again after makeEmpty
        try {
            collection.add(b1);
            assertTrue("Can add after makeEmpty", !collection.isEmpty());
            assertEquals("Size after add post makeEmpty", 1, collection.size());
        } catch (BookCollectionException e) {
            System.out.println("[FAIL] Unexpected exception: " + e.getMessage());
            testsFailed++;
        }

        System.out.println();
    }

    /**
     * Tests Book comparators (TitleComparator, AuthorComparator, PriceComparator)
     * and compareTo.
     */
    private static void testBookComparators() {
        System.out.println("--- Test: Comparators ---");

        Book b1 = new Book("Zebra Book", "Alice", "Z001", 50, 1, "P1");
        Book b2 = new Book("Apple Book", "Bob", "A001", 30, 2, "P2");
        Book b3 = new Book("Mango Book", "Alice", "M001", 40, 3, "P3");

        // TitleComparator
        Comparator<Book> titleComp = new Book.TitleComparator();
        assertTrue("TitleComparator: Apple < Mango",
                titleComp.compare(b2, b3) < 0);
        assertTrue("TitleComparator: Zebra > Mango",
                titleComp.compare(b1, b3) > 0);

        // AuthorComparator
        Comparator<Book> authorComp = new Book.AuthorComparator();
        assertTrue("AuthorComparator: Alice < Bob",
                authorComp.compare(b1, b2) < 0);
        assertEquals("AuthorComparator: same author", 0,
                authorComp.compare(b1, b3));

        // PriceComparator
        Comparator<Book> priceComp = new Book.PriceComparator();
        assertTrue("PriceComparator: 30 < 40",
                priceComp.compare(b2, b3) < 0);
        assertTrue("PriceComparator: 50 > 30",
                priceComp.compare(b1, b2) > 0);

        // compareTo (ISBN ordering)
        assertTrue("compareTo: A001 < M001", b2.compareTo(b3) < 0);
        assertTrue("compareTo: Z001 > A001", b1.compareTo(b2) > 0);

        System.out.println();
    }

    /**
     * Tests loading books from a data file (books.txt).
     */
    private static void testFromFile() {
        System.out.println("--- Test: Load From File ---");

        BookCollection collection = new BookCollectionImpl();
        File file = new File("src/books.txt");

        if (!file.exists()) {
            System.out.println("[SKIP] books.txt not found at src/books.txt");
            return;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            int count = 0;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                String[] parts = line.split("\\|");
                if (parts.length >= 6) {
                    Book book = new Book(
                            parts[0].trim(), parts[1].trim(), parts[2].trim(),
                            Integer.parseInt(parts[3].trim()),
                            Integer.parseInt(parts[4].trim()), parts[5].trim());
                    collection.add(book);
                    count++;
                }
            }
            assertEquals("Books loaded from file", true, count > 0);
            assertEquals("Collection size matches file entries", count, collection.size());
            System.out.println("Loaded " + count + " books from file.");
        } catch (IOException | BookCollectionException e) {
            System.out.println("[FAIL] Error loading file: " + e.getMessage());
            testsFailed++;
        }

        // Print collection summary
        System.out.println("Collection: " + collection);

        System.out.println();
    }
}
